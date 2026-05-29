const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const flowJs = fs.readFileSync(path.join(root, 'flow.js'), 'utf8');
const printCss = fs.readFileSync(path.join(root, 'print.css'), 'utf8');

const svgDataUrl = (label, fill) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="420" viewBox="0 0 900 420">
    <rect width="900" height="420" fill="${fill}"/>
    <rect x="70" y="70" width="760" height="260" fill="white" stroke="#8f6f3a" stroke-width="8"/>
    <text x="450" y="230" text-anchor="middle" font-family="Arial" font-size="48" fill="#141414">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Data SVG Image Preservation</title>
</head>
<body>
  <main>
    <h1>Article with Data SVG Images</h1>
    <figure id="hero-figure">
      <img src="${svgDataUrl('HERO SVG', '#f7f5ef')}" width="900" height="420" alt="Hero SVG image">
      <figcaption>Hero SVG caption.</figcaption>
    </figure>
    <p>${'This paragraph gives the print flow enough real article text to select the main content. '.repeat(8)}</p>
    <figure id="inline-figure">
      <img src="${svgDataUrl('INLINE SVG', '#e9f2f1')}" width="900" height="420" alt="Inline SVG image">
      <figcaption>Inline SVG caption.</figcaption>
    </figure>
    <p>${'This second paragraph keeps the inline figure inside the printable article body. '.repeat(8)}</p>
  </main>
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
    await page.route('**/*', route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: html,
    }));
    await page.goto('https://example.test/data-svg-image-preservation');
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
      coverImages: document.querySelectorAll('.a4lp-cover-hero img').length,
      heroHidden: document.querySelector('#hero-figure')?.classList.contains('a4lp-hide'),
      inlineHidden: document.querySelector('#inline-figure')?.classList.contains('a4lp-hide'),
      visibleFigures: Array.from(document.querySelectorAll('main figure'))
        .filter(figure => !figure.closest('.a4lp-hide')).length,
    }));

    assert.strictEqual(state.coverImages, 1, 'data SVG hero should be usable on the cover');
    assert.strictEqual(state.heroHidden, false, 'data SVG hero figure should stay in the article body');
    assert.strictEqual(state.inlineHidden, false, 'inline data SVG figure should stay in the article body');
    assert.strictEqual(state.visibleFigures, 2, 'all data SVG figures should remain visible');
    console.log('data svg preservation ok');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
