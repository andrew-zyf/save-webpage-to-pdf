const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const flowJs = fs.readFileSync(path.join(root, 'flow.js'), 'utf8');
const printCss = fs.readFileSync(path.join(root, 'print.css'), 'utf8');

const imageSvg = (label) => `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="420" viewBox="0 0 900 420">
    <rect width="900" height="420" fill="#f7f5ef"/>
    <rect x="80" y="70" width="740" height="280" fill="#fff" stroke="#8f6f3a" stroke-width="10"/>
    <text x="450" y="225" text-anchor="middle" font-family="Arial" font-size="48" fill="#141414">${label}</text>
  </svg>`;

const imageUrl = (label) => `https://www.csis.org/images/${encodeURIComponent(label.toLowerCase().replace(/\s+/g, '-'))}.svg`;

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Article Image Preservation</title>
  <meta property="og:image" content="${imageUrl('OG HERO')}">
</head>
<body>
  <article>
    <h1>Article with Images</h1>
    <figure id="hero-figure">
      <img src="${imageUrl('ARTICLE HERO')}" width="900" height="420" alt="Article hero image">
      <figcaption>Article hero caption.</figcaption>
    </figure>
    <p>${'This is the first substantial paragraph of the article. '.repeat(8)}</p>
    <figure id="inline-figure">
      <img src="${imageUrl('INLINE FIGURE')}" width="900" height="420" alt="Inline article figure">
      <figcaption>Inline figure caption.</figcaption>
    </figure>
    <p>${'This is the second substantial paragraph of the article. '.repeat(8)}</p>
  </article>
</body>
</html>`;

(async () => {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });
  const page = await browser.newPage();
  try {
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.endsWith('.svg')) {
        const label = decodeURIComponent(url.split('/').pop().replace(/\.svg$/, '')).replace(/-/g, ' ').toUpperCase();
        return route.fulfill({
          status: 200,
          contentType: 'image/svg+xml',
          body: imageSvg(label),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: html,
      });
    });
    await page.goto('https://www.csis.org/analysis/article-image-preservation');
    await page.addStyleTag({ content: printCss });
    await page.addScriptTag({ content: flowJs });
    await page.evaluate(async () => {
      window.print = () => { throw new Error('__stop_after_print__'); };
      try {
        await window.__a4lpStart({ layoutMode: 'archive' });
      } catch (error) {
        if (!String(error && error.message).includes('__stop_after_print__')) throw error;
      }
    });

    const state = await page.evaluate(() => ({
      heroHidden: document.querySelector('#hero-figure')?.classList.contains('a4lp-hide'),
      inlineHidden: document.querySelector('#inline-figure')?.classList.contains('a4lp-hide'),
      visibleArticleFigures: Array.from(document.querySelectorAll('article figure'))
        .filter(figure => !figure.closest('.a4lp-hide')).length,
      coverImages: document.querySelectorAll('.a4lp-cover-hero img').length,
    }));

    assert.strictEqual(state.coverImages, 1, 'cover hero image should still be present');
    assert.strictEqual(state.heroHidden, false, 'article hero figure should remain in the article body');
    assert.strictEqual(state.inlineHidden, false, 'inline article figure should remain in the article body');
    assert.strictEqual(state.visibleArticleFigures, 2, 'all article figures should remain visible');
    console.log('image preservation ok');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
