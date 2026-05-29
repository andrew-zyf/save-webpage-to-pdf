const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const flowJs = fs.readFileSync(path.join(root, 'flow.js'), 'utf8');
const printCss = fs.readFileSync(path.join(root, 'print.css'), 'utf8');

const imageSvg = (label) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <rect width="1200" height="700" fill="#f7f5ef"/>
  <rect x="80" y="80" width="1040" height="540" fill="#fff" stroke="#8f6f3a" stroke-width="12"/>
  <text x="600" y="370" text-anchor="middle" font-family="Arial" font-size="60" fill="#141414">${label}</text>
</svg>`;

const imageUrl = (label) => `https://images.wsj.net/im-${encodeURIComponent(label.toLowerCase().replace(/\s+/g, '-'))}.svg`;
const longPara = 'Stan Kroenke was sitting in the back of a conference room full of other NFL owners when he quietly watched another kind of football, a moment that set up the article body and gives the printer enough substantial text to classify it as content. ';
const secondPara = 'Over the past five years, that belief helped his teams win in several leagues, and the article continues with a distinct paragraph so duplicate-text cleanup does not classify it as a ghost copy in the fixture. ';

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>WSJ Fixture</title>
  <meta property="og:image" content="${imageUrl('OG HERO')}">
</head>
<body>
  <article itemtype="https://schema.org/NewsArticle">
    <h1>The Secretive Billionaire Who’s Conquering the World’s Richest Sports Leagues</h1>
    <section subscriptions-section="content">
      <div class="story-byline">
        <span>By</span>
        <a href="/news/author/andrew-beaton">Andrew Beaton</a>
        <span>and</span>
        <a href="/news/author/joshua-robinson">Joshua Robinson</a>
      </div>
      <figure id="shopping-module">
        <img src="${imageUrl('PRODUCT POLO SHIRTS')}" width="1600" height="900" alt="Reviews and recommendations for polo shirts">
        <figcaption>Reviews and recommendations: The best polo shirts to buy this season.</figcaption>
      </figure>
      <figure id="lead-photo">
        <img src="${imageUrl('STAN KROENKE LEAD')}" width="1200" height="700" alt="Stan Kroenke owns the Los Angeles Rams and Arsenal">
        <figcaption>Stan Kroenke owns teams in the NFL, NBA, NHL and Premier League. Nigel Buchanan for WSJ</figcaption>
      </figure>
      <p>${longPara.repeat(2)}${secondPara.repeat(3)}</p>
      <figure id="arsenal-photo">
        <img src="${imageUrl('ARSENAL TROPHY PHOTO')}" width="1200" height="700" alt="Arsenal players celebrate a trophy">
        <figcaption>Arsenal players celebrate a trophy. Matthew Childs/Reuters</figcaption>
      </figure>
      <p>Copyright ©2026 Dow Jones &amp; Company, Inc. All Rights Reserved. 87990cbe856818d5eddac44c7b1cdeb8</p>
    </section>
  </article>
</body>
</html>`;

const metaOnlyHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>WSJ Meta Fixture</title>
  <meta property="og:image" content="${imageUrl('PRODUCT POLO SHIRTS')}">
</head>
<body>
  <article itemtype="https://schema.org/NewsArticle">
    <h1>The Secretive Billionaire Who’s Conquering the World’s Richest Sports Leagues</h1>
    <section subscriptions-section="content">
      <p>${longPara.repeat(2)}${secondPara.repeat(3)}</p>
    </section>
  </article>
</body>
</html>`;

(async () => {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
  if (process.env.DEBUG_WSJ_TEST) {
    page.on('console', msg => console.log('[browser]', msg.type(), msg.text()));
  }
  try {
    let servedHtml = html;
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.endsWith('.svg')) {
        const label = decodeURIComponent(url.split('/').pop().replace(/^im-/, '').replace(/\.svg$/, '')).replace(/-/g, ' ').toUpperCase();
        return route.fulfill({
          status: 200,
          contentType: 'image/svg+xml',
          body: imageSvg(label),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: servedHtml,
      });
    });
    const runFlow = async () => {
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
    };

    await page.goto('https://www.wsj.com/sports/soccer/stan-kroenke-arsenal-rams-champions-league-b00db776');
    await runFlow();

    const state = await page.evaluate(() => ({
      bodyClass: document.body.className,
      coverSrc: document.querySelector('.a4lp-cover-hero img')?.getAttribute('src') || '',
      imageAlts: Array.from(document.querySelectorAll('.a4lp-reconstructed-main img')).map(img => img.alt),
      bodyText: document.querySelector('.a4lp-reconstructed-main')?.innerText || '',
    }));
    if (process.env.DEBUG_WSJ_TEST) console.log(JSON.stringify(state, null, 2));

    assert.match(state.bodyClass, /\ba4lp-reconstructed\b/, 'WSJ article should use reconstructed print output');
    assert.match(state.coverSrc, /stan-kroenke-lead/i, 'WSJ cover should use the article lead photo, not shopping or recirculation imagery');
    assert.doesNotMatch(state.coverSrc, /product-polo-shirts|og-hero/i, 'WSJ cover should not use shopping, recommendation, or fallback Open Graph imagery');
    assert.deepStrictEqual(
      state.imageAlts,
      [
        'Stan Kroenke owns the Los Angeles Rams and Arsenal',
        'Arsenal players celebrate a trophy',
      ],
      'WSJ reconstructed body should preserve article photos and remove recommendation photos'
    );
    assert.doesNotMatch(state.bodyText, /\bBy\s+Andrew Beaton\s+and\s+Joshua Robinson\b/i, 'WSJ reconstructed body should not repeat the byline');
    assert.doesNotMatch(state.bodyText, /Copyright ©2026 Dow Jones/i, 'WSJ reconstructed body should drop the trailing copyright boilerplate');

    servedHtml = metaOnlyHtml;
    await page.goto('https://www.wsj.com/sports/soccer/wsj-meta-product-image-fixture');
    await runFlow();
    const metaState = await page.evaluate(() => ({
      bodyClass: document.body.className,
      coverImages: document.querySelectorAll('.a4lp-cover-hero img').length,
    }));
    assert.match(metaState.bodyClass, /\ba4lp-reconstructed\b/, 'WSJ text-only fixture should still use reconstructed output');
    assert.strictEqual(metaState.coverImages, 0, 'WSJ should not fall back to shopping/recommendation Open Graph imagery');

    console.log('wsj reconstruction ok');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
