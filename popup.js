// ---- 站点规则白名单（按 host 字母序） ----
const SITE_RULES = {
  'carnegieendowment.org': {
    main: 'article, main article, [class*="article-body" i], [class*="post__content" i], main',
    title: 'h1',
    author: '[class*="Byline" i], [class*="author" i], [rel="author"], [itemprop="author"] [itemprop="name"], [itemprop="author"]',
    authorBio: '[class*="author-bio" i], [class*="AuthorBio" i], [class*="contributor-bio" i]',
    extraRemove: '[class*="social" i], [class*="share" i], [class*="newsletter" i], [class*="related" i], [class*="recirc" i], aside, footer, [role="contentinfo"]'
  },
  'cnn.com': {
    main: '.article__content-container, .article__content, [data-component-name="ArticleBody"], article.article .l-container, article.article, main article',
    title: 'h1.headline__text, h1[data-editable="headlineText"], h1',
    author: '.byline__name, [class*="byline__name"], [class*="byline"] a, [class*="byline"]',
    authorBio: '[class*="author-bio"], [class*="byline__bio"], [class*="contributor-bio"]',
    extraRemove: '[data-component-name*="related"], [data-component-name*="newsletter"], [data-component-name*="recommended"], [data-component-name*="zone"], [class*="zone__items"], .ad-slot, [data-uri*="ads"], [class*="related-content"], [class*="paid-partner"], [class*="related-articles"]'
  },
  'csis.org': {
    // CSIS commentary 页面：作者卡通常在正文上方（.commentary-authors / .expert-card）
    // 或在 sidebar（.expert-bio-sidebar）。两处都抓，去重后重排版。
    main: 'article, .field--name-body, .node__content, main',
    title: 'h1',
    author: '.commentary-authors a, .expert-card .expert-name, .field--name-field-experts a, .expert-name, [class*="byline"]',
    authorBio: '.commentary-authors .expert-card, .commentary-authors article, .expert-card, .expert-bio-sidebar, .field--name-field-experts > .field__item, [class*="contributor-bio"], [class*="contributor-info"]',
    extraRemove: '.related-content, .expert-bio-sidebar, .field--name-field-experts, .program-card, .social-share, .views-element-container, .region-sidebar, .commentary-authors'
  },
  'economist.com': {
    main: 'article, [data-test-id="Article"], main',
    title: 'h1',
    author: '[data-test-id*="byline"], [class*="byline"]',
    authorBio: '[data-test-id*="author-bio"], [class*="author-bio"], [class*="contributor-bio"]',
    extraRemove: '[data-test-id*="newsletter"], [data-test-id*="related"], [data-test-id*="audio"], [data-test-id*="recommend"], [data-test-id*="myft"], [class*="podcast"], [class*="newsletter-signup"], [class*="paywall"]'
  },
  'foreignaffairs.com': {
    main: 'article.article, [class*="article__body"], .article-body, .article-content, article, main',
    title: 'h1.topper__title, h1',
    author: '.topper__byline, .article-byline, [class*="byline"]',
    authorBio: '[class*="author-bio"], [class*="contributor-bio"], [class*="AuthorBio"], .article__author-info',
    extraRemove: '.article-tools, .article__related, .article__most_read, .article-tags, .promo-callout, .article-actions, .related-articles, .recirculation, .related-content, .promo-block, [class*="newsletter"], [class*="paywall-promo"], [class*="audio-player"], [class*="article-callout"], [data-armstrong-id="wrapper"]'
  },
  'newyorker.com': {
    // 取整个 <article>，避免钉死内层后正文被截断（NY 正文常被切到多个
    // .body__inner-container 段）；末尾的 recirc/newsletter/footer 模块由 extraRemove 兜底。
    main: 'article, main article, [data-attribute-verso-pattern="article-body"], [class*="ArticleBodyWrapper"], [class*="BodyWrapper"], main',
    title: 'h1',
    author: '[class*="BylineWrapper"], [data-testid*="Byline" i], [class*="Byline"], [class*="byline"]',
    authorBio: '[class*="ContributorBio"], [class*="ContributorBlock"], [class*="contributor-bio"]',
    extraRemove: [
      '[class*="ConsumerMarketingUnit"]',
      '[class*="Newsletter"]', '[class*="newsletter"]',
      '[class*="RelatedList"]', '[class*="ContentRecirc"]', '[class*="Recirc"]', '[class*="recirc"]',
      '[class*="MostPopular"]', '[class*="Recommended"]', '[class*="recommend"]',
      '[class*="ContentFooter"]', '[class*="StandardFooter"]', '[class*="ArticleFooter"]', '[class*="Footer-"]',
      '[class*="GenericCallout"]', '[class*="CalloutBlock"]',
      '[class*="Cartoon"]', '[class*="DailyCartoon"]',
      '[class*="podcast" i]',
      '[data-testid*="paywall" i]', '[data-testid*="Recirc" i]', '[data-testid*="Recommend" i]',
      '[data-testid*="MostPopular" i]', '[data-testid*="Newsletter" i]', '[data-testid*="Footer" i]',
      '[aria-label*="More from" i]', '[aria-label*="Recommended" i]', '[aria-label*="Most popular" i]',
      'aside', 'footer', '[role="contentinfo"]'
    ].join(', ')
  },
  'wsj.com': {
    main: 'section[subscriptions-section="content"], [data-module-id*="ArticleBody"], article[itemtype*="NewsArticle"] section.article-content, [class*="ArticleBody-module"] section, article section.article-content',
    title: 'h1[itemprop="headline"], h1',
    author: '[itemprop="author"], [class*="Byline"], [class*="byline"]',
    authorBio: '[class*="author-bio"], [class*="AuthorBio"], [data-module-id*="author-bio"], [class*="bylineBio"]',
    comments: '[id*="spotim"], [class*="spotim"], [data-spotim-module], [id^="conversation"], [id^="sp_message"]',
    disable: ['toc'],
    extraRemove: [
      // 听文 / 朗读 工具条
      '[aria-label*="Listen to article" i]',
      // 广告 / 播客 / 订阅
      '[data-module-id*="ad-" i]', '[data-module-id*="podcast" i]', '[data-module-id*="newsletter" i]',
      // 文末模块（按 module-id / module-zone / block-zone-name 三种命名命中）
      '[data-module-id*="related" i]', '[data-module-id*="latest" i]', '[data-module-id*="trending" i]',
      '[data-module-id*="recommended" i]', '[data-module-id*="recommendation" i]',
      '[data-module-id*="MostPopular" i]', '[data-module-id*="WhatToReadNext" i]',
      '[data-module-id*="MoreFrom" i]', '[data-module-id*="EditorsPicks" i]',
      '[data-module-zone*="bottom" i]', '[data-module-zone*="related" i]',
      '[data-module-zone*="recommend" i]', '[data-module-zone*="more" i]',
      '[data-module-zone*="popular" i]', '[data-module-zone*="trending" i]',
      '[data-block-zone-name*="bottom" i]', '[data-block-zone-name*="related" i]',
      '[data-block-zone-name*="recommend" i]', '[data-block-zone-name*="more" i]',
      // WSJTheme- 命名空间
      '[class*="WSJTheme--newsletterModule"]', '[class*="WSJTheme--related"]', '[class*="WSJTheme--latest"]',
      '[class*="WSJTheme--trending"]', '[class*="WSJTheme--mostpopular"]', '[class*="WSJTheme--recommend"]',
      '[class*="WSJTheme--carousel"]', '[class*="WSJTheme--video"]',
      // 通用 class 命名（What to Read Next / Buy Side / Recirc 等）
      '[class*="WhatToReadNext" i]', '[class*="MoreFromWsj" i]', '[class*="MoreFromWSJ" i]',
      '[class*="EditorsPicks" i]', '[class*="BuySide" i]',
      '[class*="ContentRecommendation" i]', '[class*="Recirc" i]', '[class*="Recommendation" i]',
      '[class*="related-articles"]', '[class*="latest-news"]',
      '[class*="VideoCarousel" i]', '[class*="ResponsiveThumbnail" i]',
      // aria 兜底
      '[aria-label*="Latest" i]', '[aria-label*="Recommended" i]', '[aria-label*="Most popular" i]',
      '[aria-label*="What to Read" i]', '[aria-label*="More from" i]',
      // 通用底部容器
      'aside', 'footer', '[role="contentinfo"]'
    ].join(', ')
  }
};

// ---- popup UI ----
const $ = (id) => document.getElementById(id);

async function getTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function showError(msg) {
  let el = document.getElementById('err');
  if (!el) {
    el = document.createElement('div');
    el.id = 'err';
    el.style.cssText = 'margin-top:8px;padding:6px 8px;border-radius:4px;background:#fde7e7;color:#a30000;font-size:11px;white-space:pre-wrap;word-break:break-word;';
    document.body.appendChild(el);
  }
  el.textContent = msg;
}

const SETTINGS_KEY = 'save-webpage-to-pdf.options.v1';
const RESTRICTED = /^(chrome|edge|about|chrome-extension|view-source|devtools):|^https:\/\/chrome\.google\.com\/webstore|^https:\/\/chromewebstore\.google\.com/;

function loadOptions() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

function getOptions() {
  return {
    layoutMode: $('layoutMode')?.value === 'archive' ? 'archive' : 'reading',
  };
}

function saveOptions() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(getOptions()));
  } catch {}
}

function initOptions() {
  const saved = loadOptions();
  if ($('layoutMode')) $('layoutMode').value = saved.layoutMode === 'archive' ? 'archive' : 'reading';
  ['layoutMode'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('change', saveOptions);
  });
}

function bind(id, handler) {
  $(id).addEventListener('click', async () => {
    const btn = $(id);
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '处理中…';
    try {
      const tab = await getTab();
      if (!tab?.id) throw new Error('无可用标签');
      if (!tab.url || RESTRICTED.test(tab.url)) {
        throw new Error('当前页面受 Chrome 限制（chrome://、Web Store、PDF 等），扩展无法注入脚本。请在普通网页上使用。');
      }
      const options = getOptions();
      saveOptions();
      await handler(tab, options);
      btn.textContent = '完成 ✓';
      setTimeout(() => window.close(), 600);
    } catch (e) {
      console.error('[Save Webpage]', e);
      showError((e && e.message) || String(e));
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

initOptions();

bind('pdf', async (tab, options) => {
  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ['print.css'],
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: pdfFlow,
    args: [SITE_RULES, options],
  });
});

// ---- PDF flow ----
async function pdfFlow(SITE_RULES, options = {}) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const withTimeout = (p, ms) => Promise.race([p, sleep(ms)]);
  const cleanupActions = [];
  const layoutMode = options.layoutMode === 'archive' ? 'archive' : 'reading';
  // 处理上一次打印异常留下的注入节点，避免封面/目录重复叠加。
  document.querySelectorAll('.a4lp-source').forEach(el => el.remove());
  document.querySelectorAll('.a4lp-hide').forEach(el => el.classList.remove('a4lp-hide'));
  document.querySelectorAll('.a4lp-safe').forEach(el => el.classList.remove('a4lp-safe'));
  document.documentElement.classList.remove('a4lp-print-root');
  document.body.classList.remove('a4lp-print-root', 'a4lp-mode-reading', 'a4lp-mode-archive');
  document.querySelectorAll('.a4lp-main, .a4lp-comments, .a4lp-comments-start').forEach(el => {
    el.classList.remove('a4lp-main', 'a4lp-comments', 'a4lp-comments-start');
  });
  document.querySelectorAll('.a4lp-keep').forEach(wrap => {
    const parent = wrap.parentNode;
    if (!parent) return;
    while (wrap.firstChild) parent.insertBefore(wrap.firstChild, wrap);
    parent.removeChild(wrap);
  });
  const rememberAttr = (el, name) => {
    const hadAttr = el.hasAttribute(name);
    const value = el.getAttribute(name);
    cleanupActions.push(() => {
      if (!el.isConnected) return;
      if (hadAttr) el.setAttribute(name, value);
      else el.removeAttribute(name);
    });
  };
  const rememberClass = (el, name) => {
    if (!el) return;
    const hadClass = el.classList.contains(name);
    el.classList.add(name);
    cleanupActions.push(() => {
      if (el.isConnected && !hadClass) el.classList.remove(name);
    });
  };
  rememberClass(document.documentElement, 'a4lp-print-root');
  rememberClass(document.body, 'a4lp-print-root');
  rememberClass(document.body, 'a4lp-mode-' + layoutMode);

  // 0. 触发懒加载（图片+评论模块），总预算 6s
  const origScroll = window.scrollY;
  const deadline = Date.now() + 6000;
  let lastH = 0, sameCount = 0;
  while (Date.now() < deadline) {
    const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    if (h === lastH) { if (++sameCount >= 2) break; } else { sameCount = 0; lastH = h; }
    for (let y = window.scrollY; y < h && Date.now() < deadline; y += window.innerHeight) {
      window.scrollTo(0, y);
      await sleep(60);
    }
    window.scrollTo(0, h);
    await sleep(300);
  }
  window.scrollTo(0, origScroll);

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    rememberAttr(img, 'loading');
    img.loading = 'eager';
  });

  // 0a. 自动展开 <details> 与"点击展开"按钮（仅触发 aria-expanded=false 的 button）
  const openedDetails = [];
  document.querySelectorAll('details:not([open])').forEach(d => {
    openedDetails.push(d);
    d.open = true;
  });
  if (openedDetails.length) {
    cleanupActions.push(() => {
      openedDetails.forEach(d => {
        if (d.isConnected) d.open = false;
      });
    });
  }
  const clickedExpandButtons = [];
  document.querySelectorAll('button[aria-expanded="false"]').forEach(b => {
    const txt = (b.innerText || '').trim().toLowerCase();
    if (/show more|read more|expand|展开|更多|查看更多|continue reading/.test(txt)) {
      clickedExpandButtons.push(b);
      try { b.click(); } catch {}
    }
  });
  if (clickedExpandButtons.length) {
    cleanupActions.push(() => {
      clickedExpandButtons.forEach(b => {
        if (!b.isConnected) return;
        if ((b.getAttribute('aria-expanded') || '').toLowerCase() !== 'true') return;
        try { b.click(); } catch {}
      });
    });
  }

  // 0b. 仅对当前匹配的 srcset/source 选最高分辨率候选，避免拿错断点图。
  const SUPPORTED_PICTURE_TYPES = new Set([
    'image/avif', 'image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'
  ]);
  const parseSrcset = (srcset) => {
    if (!srcset || /^\s*data:/i.test(srcset)) return [];
    return srcset.split(',').map(part => {
      const trimmed = part.trim();
      if (!trimmed) return null;
      const pieces = trimmed.split(/\s+/);
      const descriptor = pieces[1] || '';
      const width = descriptor.endsWith('w') ? parseInt(descriptor, 10) : 0;
      const density = descriptor.endsWith('x') ? parseFloat(descriptor) : 1;
      return {
        url: pieces[0],
        width: Number.isFinite(width) ? width : 0,
        density: Number.isFinite(density) ? density : 1
      };
    }).filter(Boolean);
  };
  const pickBestFromSrcset = (srcset, img) => {
    const candidates = parseSrcset(srcset);
    if (!candidates.length) return '';
    const hasWidth = candidates.some(c => c.width > 0);
    if (hasWidth) {
      const renderedWidth = Math.max(
        img?.getBoundingClientRect?.().width || 0,
        img?.clientWidth || 0
      );
      const targetWidth = Math.min(1500, Math.max(560, Math.round(renderedWidth * 1.85)));
      const sorted = [...candidates].sort((a, b) => a.width - b.width);
      return (sorted.find(c => c.width >= targetWidth) || sorted[sorted.length - 1]).url;
    }
    const targetDensity = 1.6;
    const sorted = [...candidates].sort((a, b) => a.density - b.density);
    return (sorted.find(c => c.density >= targetDensity) || sorted[sorted.length - 1]).url;
  };
  const matchesPictureSource = (source) => {
    const media = (source.getAttribute('media') || '').trim();
    if (media) {
      try {
        if (!window.matchMedia(media).matches) return false;
      } catch {
        return false;
      }
    }
    const type = (source.getAttribute('type') || '').trim().toLowerCase();
    return !type || SUPPORTED_PICTURE_TYPES.has(type);
  };
  document.querySelectorAll('img').forEach(img => {
    const pic = img.closest('picture');
    const activeSource = pic ? Array.from(pic.querySelectorAll('source[srcset]')).find(matchesPictureSource) : null;
    const srcsetOwner = activeSource || (img.hasAttribute('srcset') ? img : null);
    if (!srcsetOwner) return;
    const best = pickBestFromSrcset(srcsetOwner.getAttribute('srcset'), img);
    if (!best) return;
    let bestUrl = '';
    try {
      bestUrl = new URL(best, document.baseURI).href;
    } catch {
      return;
    }
    if (activeSource) {
      if (img.currentSrc === bestUrl) return;
      rememberAttr(activeSource, 'srcset');
      activeSource.setAttribute('srcset', bestUrl);
      return;
    }
    if (img.currentSrc === bestUrl || img.src === bestUrl) return;
    rememberAttr(img, 'src');
    if (img.hasAttribute('srcset')) rememberAttr(img, 'srcset');
    img.src = bestUrl;
    if (img.hasAttribute('srcset')) img.setAttribute('srcset', bestUrl);
  });

  await withTimeout(
    Promise.all(Array.from(document.images).map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return withTimeout(new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }), 2000);
    })),
    5000
  );

  const estimateDataUrlBytes = (dataUrl) => {
    const comma = dataUrl.indexOf(',');
    const base64Len = comma >= 0 ? (dataUrl.length - comma - 1) : dataUrl.length;
    return Math.ceil(base64Len * 0.75);
  };
  const getImageHint = (img, src) => [
    src,
    img.alt || '',
    img.getAttribute('aria-label') || '',
    img.className && typeof img.className === 'string' ? img.className : '',
    img.closest('figure')?.className || '',
    img.closest('picture')?.className || ''
  ].join(' ').toLowerCase();
  const isLikelyGraphicImage = (img, src) => {
    const hint = getImageHint(img, src);
    return /(logo|icon|avatar|chart|graph|table|diagram|infographic|map|equation|formula|qr|barcode|screenshot|code)/i.test(hint);
  };
  // 0c. 大图做更积极的重采样与重编码，优先压缩照片；跨域或不可导出图片会自动跳过。
  const compressHugeImage = (img) => {
    const src = img.currentSrc || img.src || '';
    if (!src || /^data:image\/svg\+xml/i.test(src)) return;
    if (img.closest('.a4lp-source')) return;
    const pixels = (img.naturalWidth || 0) * (img.naturalHeight || 0);
    const renderedWidth = Math.max(img.getBoundingClientRect?.().width || 0, img.clientWidth || 0);
    const renderedHeight = Math.max(img.getBoundingClientRect?.().height || 0, img.clientHeight || 0);
    if (!renderedWidth || renderedWidth < 220 || renderedHeight < 120) return;
    const likelyGraphic = isLikelyGraphicImage(img, src);
    if (likelyGraphic && pixels < 9000000) return;
    if (pixels < 2600000 && (img.naturalWidth || 0) < 1800 && (img.naturalHeight || 0) < 1400) return;
    const targetWidth = Math.min(1500, Math.max(900, Math.round(renderedWidth * 1.8)));
    const scale = Math.min(
      1,
      targetWidth / Math.max(1, img.naturalWidth || 1),
      Math.sqrt(3200000 / Math.max(1, pixels))
    );
    if (!Number.isFinite(scale) || scale <= 0) return;
    const shouldReencode = scale < 0.98 || pixels >= 3500000 || !likelyGraphic;
    if (!shouldReencode) return;
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const qualitySteps = likelyGraphic ? [0.86] : [0.78, 0.72, 0.66, 0.6];
      const byteBudget = likelyGraphic
        ? Math.min(1400000, Math.max(300000, Math.round(width * height * 0.42)))
        : Math.min(900000, Math.max(220000, Math.round(width * height * 0.22)));
      let dataUrl = '';
      for (const quality of qualitySteps) {
        const candidate = canvas.toDataURL('image/jpeg', quality);
        if (!/^data:image\/jpeg;base64,/i.test(candidate)) continue;
        dataUrl = candidate;
        if (estimateDataUrlBytes(candidate) <= byteBudget) break;
      }
      if (!/^data:image\/jpeg;base64,/i.test(dataUrl)) return;
      rememberAttr(img, 'src');
      if (img.hasAttribute('srcset')) rememberAttr(img, 'srcset');
      img.src = dataUrl;
      if (img.hasAttribute('srcset')) img.setAttribute('srcset', dataUrl);
      const pic = img.closest('picture');
      if (pic) {
        pic.querySelectorAll('source[srcset]').forEach(source => {
          rememberAttr(source, 'srcset');
          source.setAttribute('srcset', dataUrl);
        });
      }
    } catch {}
  };
  document.querySelectorAll('img').forEach(compressHugeImage);

  // 0d. 等字体就绪，避免标题/正文打印时还在用 fallback 字形
  if (document.fonts && document.fonts.ready) {
    await withTimeout(document.fonts.ready, 1500);
  }

  // 1. 抽取内容（标题/作者/作者介绍/正文/评论）+ 站点豁免（safeKeep / disable）
  const { titleEl, mainEl, commentEls, extraRemove, authorText: extractedAuthorText, authorBios, authorBioEls, safeKeep, disable, rulesMatchedHost } = pickContent(SITE_RULES);
  let authorText = extractedAuthorText;
  const off = (key) => Array.isArray(disable) && disable.includes(key);
  const isWSJ = rulesMatchedHost === 'wsj.com';
  const isNY = rulesMatchedHost === 'newyorker.com';
  const isEconomist = rulesMatchedHost === 'economist.com';
  const isFA = rulesMatchedHost === 'foreignaffairs.com';
  const isCNN = rulesMatchedHost === 'cnn.com';
  const isCarnegie = rulesMatchedHost === 'carnegieendowment.org';
  const normalizeText = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const leadBodyP = mainEl ? Array.from(mainEl.querySelectorAll('p')).find(p => {
    const text = normalizeText(p.innerText || p.textContent || '');
    return text.length >= 100 && !/^(by\b|updated\b|listen\b|story by\b|more by\b|photo illustration by\b)/i.test(text);
  }) : null;
  const leadBodyTop = leadBodyP?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
  const FRONT_MATTER_TEXT = [
    ...(isCNN ? [/^UPDATED\b/i, /^Story by\b/i] : []),
    ...(isNY ? [/^Comment$/i, /^By\s+[A-Z]/, /^[A-Z][a-z]+\s+\d{1,2},\s+\d{4}$/i, /^Photo illustration by\b/i, /^Listen(?:\s*[•·].*)?$/i] : []),
    ...(isFA ? [/^More by\b/i] : [])
  ];
  const TAIL_START_TEXT = [
    ...(isEconomist ? [/^Explore more$/i, /^For more on the latest\b/i, /^This article appeared in the .* print edition\b/i, /^From the .* edition$/i, /^Discover stories from this section\b/i, /^⇒?\s*Explore the edition$/i, /^More from [A-Z]/i] : []),
    ...(isCarnegie && layoutMode === 'reading' ? [/^Acknowledgments$/i, /^About the Author$/i, /^Notes$/i, /^More Work from Carnegie Endowment for International Peace$/i] : []),
    ...(isCarnegie && layoutMode === 'archive' ? [/^More Work from Carnegie Endowment for International Peace$/i] : [])
  ];
  // safeKeep：站点规则给出的「免疫一切隐藏」选择器集合 + .a4lp-keep 容器
  const SAFE_GUARD = ['.a4lp-keep', '.a4lp-source', '.a4lp-comments-label', safeKeep].filter(Boolean).join(', ');
  const isSafe = (el) => !!(el && el.closest && el.closest(SAFE_GUARD));
  const keptCommentEls = [];
  const getNodeMarker = (el) => {
    const parts = [];
    let cur = el;
    for (let i = 0; cur && i < 4; i++, cur = cur.parentElement) {
      parts.push(cur.id || '');
      parts.push(cur.className && typeof cur.className === 'string' ? cur.className : '');
      parts.push(cur.getAttribute && cur.getAttribute('data-testid') || '');
      parts.push(cur.getAttribute && cur.getAttribute('aria-label') || '');
      if (cur === mainEl) break;
    }
    return parts.join(' ');
  };
  const isSupplementalNode = (el) => {
    if (!el || !mainEl || !mainEl.contains(el)) return false;
    const marker = getNodeMarker(el);
    if (/(related|recommended|recommendation|latest|trending|morefrom|more-from|newsletter|buyside|buy-side|author-bio|bylinebio|contributor|spotlight|recirc|mostpopular|editorspicks|reprints|copyright|subscription)/i.test(marker)) return true;
    const text = normalizeText(el.innerText || el.textContent || '');
    if (!text) return false;
    if (/^this copy is for your personal, non-commercial use only/i.test(text)) return true;
    if (/^(explore more|from the .* edition|discover stories from this section|more from [a-z].*|plot twist newsletter\b|this article appeared in the .* print edition|more work from carnegie endowment for international peace|acknowledgments|about the author|notes|more by\b|listen(?:\s*[•·].*)?)$/i.test(text)) return true;
    if (/^carnegie does not take institutional positions on public policy issues/i.test(text)) return true;
    if (isWSJ && /^(write to\s|wsj\s*\|\s*buy side|reviews and recommendations|real estate insights|content provided by|alison sider writes about|ben cohen writes the|for non-personal use or to order multiple copies)/i.test(text)) return true;
    return false;
  };
  // 把 safeKeep 节点先打标记，避免后续 keep-path 把它们误伤
  if (safeKeep) document.querySelectorAll(safeKeep).forEach(el => el.classList.add('a4lp-safe'));
  if (mainEl) rememberClass(mainEl, 'a4lp-main');
  authorBioEls.forEach(el => {
    if (!isSafe(el)) el.classList.add('a4lp-hide');
  });

  commentEls.forEach(el => el.classList.add('a4lp-hide'));
  if (isWSJ) {
    document.querySelectorAll([
      '[data-module-id*="author-bio" i]',
      '[class*="author-bio" i]',
      '[class*="bylineBio" i]',
      '[class*="contributor" i]',
      '[class*="bio" i][class*="author" i]'
    ].join(', ')).forEach(el => {
      if (!isSafe(el)) el.classList.add('a4lp-hide');
    });
  }

  // 2. 隐藏小漂浮 fixed
  if (!off('fixedHide')) {
    const vw = window.innerWidth, vh = window.innerHeight;
    document.querySelectorAll('body *').forEach(el => {
      if (isSafe(el)) return;
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed') return;
      const r = el.getBoundingClientRect();
      const area = r.width * r.height;
      if (area > 0 && area < vw * vh * 0.3) el.classList.add('a4lp-hide');
    });
  }

  // 3. 站点规则的 extraRemove
  if (extraRemove && !off('extraRemove')) {
    document.querySelectorAll(extraRemove).forEach(el => {
      if (isSafe(el)) return;
      el.classList.add('a4lp-hide');
    });
  }

  // 4. 广告占位文字
  if (!off('adText')) {
    const AD_LABEL_RE = /^\s*(advertisement|sponsored(\s+content)?|promoted(\s+content)?|sponsor|广告|推广|赞助|赞助内容)\s*[:：]?\s*$/i;
    document.querySelectorAll('p, div, span, aside, section, small, label, figcaption').forEach(el => {
      if (isSafe(el)) return;
      if (el.children.length > 1) return;
      const text = (el.innerText || el.textContent || '').trim();
      if (text && text.length <= 20 && AD_LABEL_RE.test(text)) el.classList.add('a4lp-hide');
    });
  }

  // 4b. 打印版权提示 / 当前 URL 回显
  const currentPath = location.pathname.replace(/\/+$/, '');
  const currentUrlVariants = new Set([
    location.href.replace(/[?#].*$/, ''),
    location.origin.replace(/^https?:\/\//, '') + currentPath,
    location.hostname.replace(/^www\./, '') + currentPath
  ].filter(Boolean));
  document.querySelectorAll('p, div, span, section, small').forEach(el => {
    if (isSafe(el)) return;
    if (el.children.length > 2) return;
    const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text || text.length > 500) return;
    if (/this copy is for your personal, non-commercial use only|dow jones reprints|subscriber agreement/i.test(text)) {
      el.classList.add('a4lp-hide');
      return;
    }
    if (currentUrlVariants.has(text)) el.classList.add('a4lp-hide');
  });
  if (isWSJ) {
    document.querySelectorAll('p, div, span, section, small, figcaption').forEach(el => {
      if (isSafe(el)) return;
      const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > 900) return;
      if (/^(alison sider writes about|ben cohen writes the science of success column|write to alison sider|write to ben cohen|saverio truglia for wsj)$/i.test(text)) {
        el.classList.add('a4lp-hide');
      }
    });
  }

  // 5. 收听/保存/打印/分享类按钮 + 工具条
  if (!off('actionButton')) {
  // 5a. 显式工具条容器（icon-only 按钮没文字，必须靠选择器命中）
  const TOOLBAR_SELECTORS = [
    '[class*="ActionBar" i]', '[class*="action-bar" i]',
    '[class*="ArticleActions" i]', '[class*="article-actions" i]',
    '[class*="ToolBar" i]', '[class*="toolbar" i]',
    '[class*="SocialIcon" i]', '[class*="social-share" i]', '[class*="ShareTools" i]',
    '[class*="SaveButton" i]', '[class*="save-button" i]', '[class*="BookmarkButton" i]',
    '[class*="ListenButton" i]', '[class*="listen-button" i]', '[class*="AudioPlayer" i]',
    '[class*="ContentHeaderRubric" i] [class*="actions" i]',
    '[data-testid*="ActionBar" i]', '[data-testid*="ToolBar" i]', '[data-testid*="ShareBar" i]',
    '[data-testid*="SaveButton" i]', '[data-testid*="BookmarkButton" i]', '[data-testid*="ListenButton" i]',
    '[data-testid*="Follow" i]', 'button[title*="Follow" i]', 'button[aria-label*="Follow" i]',
    '[aria-label="Save this story" i]', '[aria-label*="Save for later" i]', '[aria-label*="Save article" i]',
    '[aria-label*="Listen to this" i]', '[aria-label*="Listen to article" i]', '[aria-label*="Play audio" i]',
    '[aria-label*="Share this" i]', '[aria-label*="Share article" i]', '[aria-label*="Share on" i]',
    '[aria-label*="Print this" i]', '[aria-label*="Bookmark" i]'
  ].join(', ');
  document.querySelectorAll(TOOLBAR_SELECTORS).forEach(el => {
    if (isSafe(el)) return;
    el.classList.add('a4lp-hide');
  });

  // 5b. 文本/aria-label/title 按短动作短语命中（覆盖 icon-only 按钮）
  const ACTION_RE = /^(\s*[\d\s·•|]*)?(收听本文|收听|朗读|播放音频|播放|打印本页|打印|存档|收藏本文|收藏|分享到|分享|订阅|关注|举报|纠错|点赞|喜欢|转发|复制链接|复制|加入书签|查看原文|english version|繁體|简体|listen(?:\s+to\s+(?:this\s+)?(?:article|story))?|listen now|play(?:\s+audio)?|print(?:\s+(?:this\s+)?(?:page|article|story))?|archive(?:d)?|save(?:\s+(?:this\s+)?(?:story|article|for\s+later))?|saved|bookmark|share(?:\s+(?:this|article|story|on\s+\w+))?|copy\s+link|subscribe|follow|report|like|gift(?:\s+(?:this\s+)?article)?)(\s*[\d\s·•|]*)?$/i;
  // 全页扫描，不再仅限于 mainEl（NY 的 Save/Listen 工具条在 article 头部、和正文同级或更上层）
  document.querySelectorAll('button, a, span, li, div, p, [role="button"]').forEach(el => {
    if (isSafe(el)) return;
    if (el.closest('.a4lp-hide')) return;
    if (el.children.length > 3) return;
    const text  = (el.innerText || el.textContent || '').trim();
    const aria  = (el.getAttribute && el.getAttribute('aria-label') || '').trim();
    const title = (el.getAttribute && el.getAttribute('title') || '').trim();
    const candidates = [text, aria, title].filter(s => s && s.length <= 40);
    if (!candidates.some(s => ACTION_RE.test(s))) return;
    // 上溯最多 2 层，把整个按钮容器一起隐藏（按钮+图标+标签 通常包在小 div 里）
    let target = el;
    for (let i = 0; i < 2; i++) {
      const p = target.parentElement;
      if (!p || p === document.body) break;
      if (isSafe(p)) break;
      if ((p.innerText || '').trim().length < 60) target = p; else break;
    }
    target.classList.add('a4lp-hide');
  });
  } // /actionButton

  const bubbleHideTarget = (el, maxFactor = 2.8, hardMax = 900) => {
    let target = el;
    for (let i = 0; i < 2; i++) {
      const parent = target.parentElement;
      if (!parent || parent === mainEl || parent === document.body || isSafe(parent)) break;
      const parentLen = normalizeText(parent.innerText || parent.textContent || '').length;
      const targetLen = Math.max(1, normalizeText(target.innerText || target.textContent || '').length);
      if (parentLen <= Math.max(hardMax, targetLen * maxFactor)) target = parent;
      else break;
    }
    return target;
  };
  const isAfterLeadBody = (el) => {
    if (!leadBodyP) return true;
    return !!(el.compareDocumentPosition(leadBodyP) & Node.DOCUMENT_POSITION_PRECEDING);
  };
  const hideLeadMatches = (patterns) => {
    if (!mainEl || !patterns.length || !Number.isFinite(leadBodyTop)) return;
    mainEl.querySelectorAll('p, div, span, small, h2, h3, h4, section, header, figure, figcaption, li, time').forEach(el => {
      if (isSafe(el) || el.closest('.a4lp-hide')) return;
      const rect = el.getBoundingClientRect();
      if (!rect.height || rect.bottom > leadBodyTop + 48) return;
      const text = normalizeText(el.innerText || el.textContent || '');
      if (!text || text.length > 500) return;
      if (!patterns.some(re => re.test(text))) return;
      bubbleHideTarget(el).classList.add('a4lp-hide');
    });
  };
  const hideFromNodeToEnd = (node) => {
    if (!node || !mainEl || !mainEl.contains(node)) return;
    const start = bubbleHideTarget(node, 3.2, 4000);
    start.classList.add('a4lp-hide');
    let cur = start;
    while (cur && cur !== mainEl) {
      let sib = cur.nextElementSibling;
      while (sib) {
        const next = sib.nextElementSibling;
        if (!isSafe(sib)) sib.classList.add('a4lp-hide');
        sib = next;
      }
      cur = cur.parentElement;
    }
  };
  const stripFromMarker = (patterns) => {
    if (!mainEl || !patterns.length) return;
    const marker = Array.from(mainEl.querySelectorAll('h1, h2, h3, h4, p, div, section, aside, li')).find(el => {
      if (isSafe(el) || el.closest('.a4lp-hide')) return false;
      if (!isAfterLeadBody(el)) return false;
      const text = normalizeText(el.innerText || el.textContent || '');
      if (!text || text.length > 600) return false;
      return patterns.some(re => re.test(text));
    });
    if (marker) hideFromNodeToEnd(marker);
  };
  if (FRONT_MATTER_TEXT.length) hideLeadMatches(FRONT_MATTER_TEXT);
  if (TAIL_START_TEXT.length) stripFromMarker(TAIL_START_TEXT);
  if (isCarnegie) {
    document.querySelectorAll('p, div, span, section, small').forEach(el => {
      if (isSafe(el)) return;
      const text = normalizeText(el.innerText || el.textContent || '');
      if (/^carnegie does not take institutional positions on public policy issues/i.test(text)) {
        bubbleHideTarget(el, 3.2, 2000).classList.add('a4lp-hide');
      }
    });
  }

  // 5c. 文末卡片条清理：仅清理 mainEl 内、正文尾部之后的明显 recirc 模块，
  // 不再按“最后一个长段落之后全部隐藏”的方式截断，避免误删合法短结尾。
  if (mainEl && !off('trailingCardStrip')) {
    const substantive = [];
    mainEl.querySelectorAll('p, blockquote, figure, li, h2, h3, h4, pre, table').forEach(el => {
      if (isSupplementalNode(el)) return;
      const t = (el.innerText || '').trim();
      if (el.tagName === 'FIGURE' || el.tagName === 'TABLE' || t.length >= 60) substantive.push(el);
    });
    const lastReal = substantive[substantive.length - 1] || null;
    const RECIRC_RE = /(related|recommended|recommendation|read next|what to read|more from|more to read|latest|trending|most popular|popular|newsletter|you may also like|continue reading|相关阅读|延伸阅读|更多阅读|推荐阅读|相关文章|最新|热门|猜你喜欢)/i;
    const looksLikeRecirculation = (el) => {
      const marker = [
        el.id,
        el.className && typeof el.className === 'string' ? el.className : '',
        el.getAttribute && el.getAttribute('aria-label') || '',
        el.getAttribute && el.getAttribute('data-testid') || ''
      ].join(' ');
      if (RECIRC_RE.test(marker)) return true;
      const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
      if (!text) return false;
      const links = el.querySelectorAll('a').length;
      const items = el.querySelectorAll('li, article, section, .card, [class*="card" i]').length;
      const longParas = Array.from(el.querySelectorAll('p')).filter(p => ((p.innerText || '').trim().length >= 120)).length;
      const linkText = Array.from(el.querySelectorAll('a')).reduce((sum, a) => sum + ((a.innerText || '').trim().length), 0);
      const linkRatio = text.length ? (linkText / text.length) : 0;
      if (RECIRC_RE.test(text.slice(0, 240))) return true;
      if (links >= 4 && linkRatio > 0.45 && longParas <= 1) return true;
      if (items >= 3 && longParas === 0 && text.length < 2500) return true;
      return false;
    };
    if (lastReal) {
      let cur = lastReal;
      while (cur && cur !== mainEl) {
        let sib = cur.nextElementSibling;
        while (sib) {
          const next = sib.nextElementSibling;
          if (!sib.closest('.a4lp-hide') &&
              !isSafe(sib) &&
              !keptCommentEls.some(c => c === sib || c.contains(sib) || sib.contains(c)) &&
              (isWSJ || looksLikeRecirculation(sib) || isSupplementalNode(sib))) {
            sib.classList.add('a4lp-hide');
          }
          sib = next;
        }
        cur = cur.parentElement;
      }
    }
  }

  // 6. keep-path：保留 title/main/comments/safeKeep 路径，隐藏其他兄弟
  if (!off('keepPath')) {
    const keepRoots = new Set();
    if (mainEl) keepRoots.add(mainEl);
    if (titleEl && !(mainEl && mainEl.contains(titleEl))) {
      let tb = titleEl;
      for (let i = 0; i < 4; i++) {
        const p = tb.parentElement;
        if (!p || p === document.body || p === document.documentElement) break;
        if ((p.innerText || '').length < (tb.innerText || '').length * 4) tb = p; else break;
      }
      keepRoots.add(tb);
    }
    keptCommentEls.forEach(el => keepRoots.add(el));
    // safeKeep 节点同样视为 keep root，避免被「不在 path 上」的兄弟逻辑挤掉
    if (safeKeep) document.querySelectorAll(safeKeep).forEach(el => keepRoots.add(el));

    if (keepRoots.size > 0) {
      const onPath = new Set();
      keepRoots.forEach(root => {
        let cur = root;
        while (cur && cur !== document.documentElement) { onPath.add(cur); cur = cur.parentElement; }
      });
      onPath.forEach(node => {
        const parent = node.parentElement;
        if (!parent) return;
        for (const sib of parent.children) {
          if (sib === node) continue;
          if (onPath.has(sib) || keepRoots.has(sib)) continue;
          if (isSafe(sib)) continue;
          sib.classList.add('a4lp-hide');
        }
      });
    }
  }

  // 7. 封面页（标题/作者卡/SOURCE/日期）+ 独立目录页，一并插到 body 最前
  const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const titleText = (titleEl?.innerText || document.title || '').trim();
  const today = new Date();
  const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const sourceHost = location.hostname.replace(/^www\./, '');
  const inlineSource = sourceHost + (location.pathname && location.pathname !== '/' ? location.pathname : '');
  const filenameSuffix = layoutMode === 'archive' ? ' - archive' : ' - reading';
  const basePrintTitle = (titleText || document.title || 'saved-webpage').replace(/\s+-\s+(reading|archive)$/i, '').trim();
  const printTitle = basePrintTitle + filenameSuffix;
  if (document.title !== printTitle) {
    const prevTitle = document.title;
    document.title = printTitle;
    cleanupActions.push(() => { document.title = prevTitle; });
  }

  const insertHost = document.createElement('div');
  insertHost.className = 'a4lp-source';

  // 7a. 封面页 / 阅读版抬头
  let html = '<section class="a4lp-cover a4lp-cover--' + layoutMode + '">' +
    '<div class="a4lp-cover-kicker">' +
      (layoutMode === 'archive' ? 'SAVED WEBPAGE · ' + escapeHtml(dateStr) : 'READING COPY · ' + escapeHtml(dateStr)) +
    '</div>' +
    (titleText ? '<h1 class="a4lp-cover-title">' + escapeHtml(titleText) + '</h1>' : '') +
    (authorText ? '<div class="a4lp-cover-by">BY ' + escapeHtml(authorText) + '</div>' : '');

  if (layoutMode === 'archive' && authorBios && authorBios.length) {
    html += '<div class="a4lp-authors"><div class="a4lp-authors-h">作者介绍 / Authors</div>';
    authorBios.forEach(b => {
      html += '<div class="a4lp-author">';
      if (b.name) html += '<span class="a4lp-author-name">' + escapeHtml(b.name) + '</span>';
      if (b.role) html += '<span class="a4lp-author-role">' + (b.name ? ' — ' : '') + escapeHtml(b.role) + '</span>';
      if (b.bio)  html += '<div class="a4lp-author-bio">' + escapeHtml(b.bio) + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  html += '<div class="a4lp-cover-source"><span>SOURCE</span><div class="a4lp-cover-url">' +
    escapeHtml(layoutMode === 'archive' ? location.href : inlineSource) +
    '</div></div>';

  // 7b. 自动目录：短目录内联；长目录独立分页
  const headings = mainEl ? Array.from(mainEl.querySelectorAll('h1, h2, h3')).filter(h => {
    if (h === titleEl) return false;
    if (h.closest('.a4lp-hide')) return false;
    if (isSupplementalNode(h)) return false;
    return (h.innerText || '').trim().length > 0;
  }) : [];
  const firstBodyP = mainEl ? Array.from(mainEl.querySelectorAll('p')).find(p => {
    if (p.closest('.a4lp-hide') || isSupplementalNode(p)) return false;
    return (p.innerText || '').trim().length >= 100;
  }) : null;
  const headingChars = headings.reduce((sum, h) => sum + (h.innerText || '').trim().length, 0);
  const tocMinHeadings = layoutMode === 'archive' ? 3 : 4;
  const separateToc = headings.length > 8 || headingChars > 280;
  const renderToc = () => {
    if (off('toc')) return '';
    if (headings.length < tocMinHeadings) return '';
    let tocHtml = '<nav class="a4lp-toc"><div class="a4lp-toc-h">目录 / Contents</div><ul>';
    let slug = 0;
    headings.forEach(h => {
      if (firstBodyP && (h.compareDocumentPosition(firstBodyP) & Node.DOCUMENT_POSITION_FOLLOWING)) return;
      if (h.closest('a') || h.querySelector('a')) return;
      if (!h.id) h.id = 'a4lp-toc-' + (++slug);
      const lvl = Number(h.tagName[1]);
      tocHtml += '<li class="a4lp-toc-l' + lvl + '"><a href="#' + h.id + '">' + escapeHtml((h.innerText || '').trim()) + '</a></li>';
    });
    tocHtml += '</ul></nav>';
    return tocHtml.includes('<li ') ? tocHtml : '';
  };
  const tocHtml = renderToc();
  if (tocHtml && !separateToc) {
    html += tocHtml;
  }
  html += '</section>'; // 关闭 .a4lp-cover
  if (tocHtml && separateToc) {
    html += '<section class="a4lp-toc-page">' + tocHtml + '</section>';
  }

  insertHost.innerHTML = html;
  document.body.insertBefore(insertHost, document.body.firstChild);

  // 7d. 隐藏正文中的原 <h1>，避免与封面大标题重复
  if (titleEl) titleEl.classList.add('a4lp-hide');

  // 7c. 诊断日志
  console.log('[Save Webpage to PDF] extraction', {
    title: titleText,
    titleEl: titleEl?.tagName,
    mainEl: mainEl?.tagName + (mainEl?.id ? '#' + mainEl.id : '') + (mainEl?.className ? '.' + String(mainEl.className).split(' ').slice(0, 2).join('.') : ''),
    bodyChars: (mainEl?.innerText || '').length,
    paragraphCount: mainEl?.querySelectorAll('p').length || 0,
    author: authorText,
    authorBioCount: authorBios?.length || 0,
    headingCount: headings.length,
    commentContainers: keptCommentEls.length,
    layoutMode,
    separateToc,
    siteRulesHit: rulesMatchedHost || '(generic)',
    safeKeep: safeKeep || '(none)',
    disabled: Array.isArray(disable) && disable.length ? disable.join(',') : '(none)'
  });

  // 8. 图+caption 成组
  if (off('figureGroup')) { /* skip */ } else {
  const isCaption = (el) => {
    if (!el || el.nodeType !== 1) return false;
    const text = (el.textContent || '').trim();
    if (text.length > 300) return false;
    if (el.tagName === 'FIGCAPTION') return true;
    const cls = (el.className && typeof el.className === 'string') ? el.className.toLowerCase() : '';
    if (/caption|figure|desc|note/.test(cls)) return true;
    if (['EM', 'I', 'SMALL'].includes(el.tagName) && text.length < 200) return true;
    return false;
  };
  document.querySelectorAll('img').forEach(img => {
    if (img.closest('figure, .a4lp-keep')) return;
    let anchor = img;
    while (anchor.parentElement && anchor.parentElement.children.length === 1 && anchor.parentElement.tagName !== 'BODY') {
      anchor = anchor.parentElement;
    }
    const next = anchor.nextElementSibling;
    if (!isCaption(next)) return;
    const wrap = document.createElement('div');
    wrap.className = 'a4lp-keep';
    anchor.parentNode.insertBefore(wrap, anchor);
    wrap.appendChild(anchor);
    wrap.appendChild(next);
  });
  } // /figureGroup

  // 9. 清理标记与临时 DOM 变更
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.querySelectorAll('.a4lp-hide').forEach(el => el.classList.remove('a4lp-hide'));
    document.querySelectorAll('.a4lp-safe').forEach(el => el.classList.remove('a4lp-safe'));
    document.querySelectorAll('.a4lp-keep').forEach(wrap => {
      const parent = wrap.parentNode;
      while (wrap.firstChild) parent.insertBefore(wrap.firstChild, wrap);
      parent.removeChild(wrap);
    });
    document.querySelectorAll('.a4lp-source').forEach(el => el.remove());
    for (let i = cleanupActions.length - 1; i >= 0; i--) {
      try { cleanupActions[i](); } catch {}
    }
  };

  await sleep(300);
  window.addEventListener('afterprint', cleanup, { once: true });
  window.print();
  setTimeout(cleanup, 0);

  // ---- 内嵌 helper：与 mdFlow 共用 ----
  function pickContent(SITE_RULES) {
    const host = location.hostname.replace(/^www\./, '').replace(/^edition\./, '').replace(/^m\./, '');
    let rules = null, rulesMatchedHost = '';
    for (const k in SITE_RULES) if (host === k || host.endsWith('.' + k)) { rules = SITE_RULES[k]; rulesMatchedHost = k; break; }

    let titleEl = rules?.title ? document.querySelector(rules.title) : null;
    if (!titleEl) {
      let bestSize = 0;
      document.querySelectorAll('h1').forEach(h => {
        if (h.closest('nav, footer, [role="navigation"], [role="contentinfo"]')) return;
        const r = h.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        const sz = parseFloat(getComputedStyle(h).fontSize) || 0;
        if (sz > bestSize) { bestSize = sz; titleEl = h; }
      });
    }

    // 候选池：站点规则优先；按"段落文本评分"挑选，避免选到链接列表/侧栏。
    // score = sum(<p>.innerText) - 0.7 * sum(<a>.innerText) - 50 * (链接数 - 段落数 之差)
    const score = (el) => {
      const ps = el.querySelectorAll('p');
      let pText = 0;
      ps.forEach(p => { pText += (p.innerText || '').trim().length; });
      const as = el.querySelectorAll('a');
      let aText = 0;
      as.forEach(a => { aText += (a.innerText || '').trim().length; });
      const linkPenalty = Math.max(0, as.length - ps.length) * 50;
      return pText - 0.7 * aText - linkPenalty;
    };
    const mainCandidates = [];
    const seen = new Set();
    const tryAdd = (el, fromRule, priority = 999) => {
      if (!el || !el.isConnected || seen.has(el)) return;
      seen.add(el);
      const text = (el.innerText || '').trim().length;
      if (text < 200) return;
      const s = score(el);
      if (s < 200) return;
      mainCandidates.push({ el, score: s, fromRule: !!fromRule, priority });
    };
    if (rules?.main) {
      rules.main.split(',').map(s => s.trim()).forEach((sel, index) => {
        document.querySelectorAll(sel).forEach(el => tryAdd(el, true, index));
      });
    }
    ['article', 'main', '[role="main"]', '#content', '#main', '.post', '.article', '.entry-content']
      .forEach((sel, index) => document.querySelectorAll(sel).forEach(el => tryAdd(el, false, 100 + index)));
    // 兜底：扫所有 div/section，挑段落分数最高的一个
    let bestDiv = null, bestDivScore = 0;
    document.querySelectorAll('div, section').forEach(el => {
      if (seen.has(el)) return;
      if (el.querySelectorAll('div, section').length > 80) return;
      const s = score(el);
      if (s > bestDivScore) { bestDivScore = s; bestDiv = el; }
    });
    if (bestDiv) tryAdd(bestDiv, false);

    let mainEl = null;
    if (mainCandidates.length > 0) {
      // 命中站点规则的优先；同组内分数最高者胜出
      mainCandidates.sort((a, b) => {
        if (a.fromRule !== b.fromRule) return a.fromRule ? -1 : 1;
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.score - a.score;
      });
      mainEl = mainCandidates[0].el;
    } else {
      mainEl = document.body;
    }

    const commentSel = [
      rules?.comments || '',
      '#comments', '#disqus_thread', '#respond',
      '[id*="comment"]', '[class*="comment"]',
      '[id*="coral"]', '[class*="coral"]',
      '[id*="spotim"]', '[class*="spotim"]', '[data-spotim-module]',
      '[id*="openweb"]', '[class*="openweb"]',
      '[id^="conversation"]', '[id^="sp_message"]',
      '[id*="discussion"]', '[class*="discussion"]',
      'iframe[src*="comment"]', 'iframe[src*="coral"]', 'iframe[src*="disqus"]',
      'iframe[src*="spot.im"]', 'iframe[src*="openweb"]',
      '[role="complementary"][aria-label*="comment" i]'
    ].filter(Boolean).join(',');

    const commentEls = [];
    document.querySelectorAll(commentSel).forEach(el => {
      if (mainEl && mainEl.contains(el)) return;
      if (titleEl && titleEl.contains(el)) return;
      // 去重：保留最外层
      for (let i = commentEls.length - 1; i >= 0; i--) {
        if (commentEls[i].contains(el)) return;
        if (el.contains(commentEls[i])) commentEls.splice(i, 1);
      }
      const txt = (el.innerText || '').trim();
      if (el.tagName !== 'IFRAME' && txt.length < 30 && el.children.length < 2) return;
      commentEls.push(el);
    });

    // author 抽取：站点规则 → meta 标签 → schema.org → byline 启发式
    const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanAuthor = (s) => (s || '')
      .replace(/\s+/g, ' ')
      .replace(/^\s*(by|story by|from|作者|文\/|文：|撰文|文)\s*[:：]?\s*/i, '')
      .replace(/\s*[|•·]\s*\d+\s+min(?:ute)?s?\s+read\b/ig, '')
      .replace(/\s*,?\s*updated\b.*$/i, '')
      .replace(/^[,;|•·\s]+|[,;|•·\s]+$/g, '')
      .trim()
      .slice(0, 200);
    const authorCount = (s) => cleanAuthor(s).split(/\s*,\s*/).filter(Boolean).length;
    const isPublicationName = (s) => /^(the new yorker|foreign affairs|carnegie endowment(?: for international peace)?|wsj|wall street journal|cnn)$/i.test(cleanAuthor(s));
    const pickAuthorFromSelector = (selector) => {
      const scopes = [];
      const titleScope = titleEl?.closest('header, article, main, section');
      if (titleScope) scopes.push(titleScope);
      if (mainEl && !scopes.includes(mainEl)) scopes.push(mainEl);
      scopes.push(document);
      let best = null;
      for (const scope of scopes) {
        const nodes = scope === document ? document.querySelectorAll(selector) : scope.querySelectorAll(selector);
        nodes.forEach(el => {
          const text = cleanAuthor(el.innerText || el.textContent);
          if (!text || text.length > 180 || isPublicationName(text)) return;
          let score = 0;
          const rect = el.getBoundingClientRect();
          const titleRect = titleEl?.getBoundingClientRect();
          if (mainEl && mainEl.contains(el)) score += 20;
          if (titleRect && rect.top >= titleRect.top - 80 && rect.top <= titleRect.bottom + 520) score += 60;
          if (/^by\s+/i.test((el.innerText || el.textContent || '').trim())) score += 20;
          const count = authorCount(text);
          if (count === 1) score += 25;
          else if (count === 2) score += 12;
          else if (count > 4) score -= 40;
          if (text.length <= 60) score += 15;
          else if (text.length > 120) score -= 20;
          if (/(listen|updated|minute read|newsletter|follow|source|comment|staff writer at)/i.test(text)) score -= 60;
          if (!best || score > best.score) best = { text, score };
        });
        if (best && best.score >= 50 && scope !== document) break;
      }
      return best?.text || '';
    };
    const ruleAuthor = rules?.author ? pickAuthorFromSelector(rules.author) : '';
    const meta = document.querySelector('meta[name="author"], meta[property="article:author"], meta[name="byl"], meta[name="parsely-author"]');
    const metaAuthor = meta ? cleanAuthor(meta.getAttribute('content')) : '';
    const sch = document.querySelector('[itemprop="author"] [itemprop="name"], [itemprop="author"]');
    const schemaAuthor = sch ? cleanAuthor(sch.innerText || sch.textContent) : '';
    let fallbackAuthor = '';
    if (!fallbackAuthor) {
      const scope = mainEl || document.body;
      const cand = scope.querySelector('[rel="author"], .author, .byline, [class*="byline" i], [class*="Byline"], [class*="author-name" i]');
      if (cand) fallbackAuthor = cleanAuthor(cand.innerText || cand.textContent);
    }
    const provisionalAuthor = ruleAuthor || metaAuthor || schemaAuthor || fallbackAuthor;

    // authorBios 抽取：站点规则的 authorBio 选择器 + 通用 fallback
    // 每个 bio 解析出 {name, role, bio}，去重后返回。
    const bioSelector = [
      rules?.authorBio || '',
      '[class*="author-bio" i]', '[class*="contributor-bio" i]', '[class*="contributor-info" i]',
      '[class*="AuthorBio"]', '[class*="ContributorBio"]'
    ].filter(Boolean).join(',');
    const bioEls = [];
    document.querySelectorAll(bioSelector).forEach(el => {
      const txt = (el.innerText || '').trim();
      if (txt.length < 20 || txt.length > 1500) return;
      // 去重：保留最外层
      for (let i = bioEls.length - 1; i >= 0; i--) {
        if (bioEls[i].contains(el)) return;
        if (el.contains(bioEls[i])) bioEls.splice(i, 1);
      }
      bioEls.push(el);
    });
    const parseBio = (el) => {
      const siteNameRe = /^(the new yorker|foreign affairs|carnegie endowment(?: for international peace)?|wsj|wall street journal|cnn)$/i;
      const nameEl = el.querySelector('a[href*="/people/"], a[href*="/author"], a[href*="/expert"], h2 a, h3 a, h2, h3, .name, [class*="name" i] a, [class*="name" i], strong');
      let name = cleanAuthor(nameEl?.innerText || nameEl?.textContent || '');
      if (siteNameRe.test(name)) name = '';
      const roleEl = el.querySelector('.title, .position, .role, [class*="title" i]:not(h1):not(h2):not(h3), [class*="position" i], [class*="role" i], em, small');
      let role = (roleEl?.innerText || roleEl?.textContent || '').replace(/\s+/g, ' ').trim();
      if (role && name && role.toLowerCase().includes(name.toLowerCase())) role = '';
      if (siteNameRe.test(role)) role = '';
      role = role.slice(0, 200);
      let bio = '';
      const ps = el.querySelectorAll('p');
      ps.forEach(p => {
        const t = (p.innerText || '').trim();
        if (t.length > bio.length) bio = t;
      });
      if (!bio) {
        bio = (el.innerText || '').replace(/\s+/g, ' ').trim();
        if (name) bio = bio.replace(name, '').trim();
        if (role) bio = bio.replace(role, '').trim();
      }
      if (!name) {
        const lead = bio.match(/^([A-Z][A-Za-z.'’\-]+(?:\s+[A-Z][A-Za-z.'’\-]+){1,4})\s+(?:is|was|writes|covers|has been|serves|holds)\b/);
        if (lead) name = cleanAuthor(lead[1]);
      }
      if (!name && provisionalAuthor && authorCount(provisionalAuthor) <= 2) {
        const primary = provisionalAuthor.split(/\s*,\s*/)[0];
        if (primary && bio.toLowerCase().startsWith(primary.toLowerCase() + ' ')) name = primary;
      }
      if (name) bio = bio.replace(new RegExp('^' + escapeRegex(name) + '\\s+'), '').trim();
      bio = bio.slice(0, 600);
      return { name, role, bio };
    };
    const authorBios = bioEls.map(parseBio).filter(b => b.name || b.bio);
    // 同名去重
    const seenNames = new Set();
    const dedupBios = [];
    authorBios.forEach(b => {
      const key = (b.name || b.bio.slice(0, 40)).toLowerCase();
      if (seenNames.has(key)) return;
      seenNames.add(key);
      dedupBios.push(b);
    });
    let authorText = provisionalAuthor;
    const primaryBioName = dedupBios.find(b => b.name)?.name || '';
    if (rulesMatchedHost === 'newyorker.com' && authorCount(authorText) > 3) {
      if (metaAuthor && authorCount(metaAuthor) <= 2) authorText = metaAuthor;
      else if (primaryBioName) authorText = primaryBioName;
    }
    if ((!authorText || authorCount(authorText) > 4 || authorText.length > 120) && metaAuthor && authorCount(metaAuthor) <= 2) {
      authorText = metaAuthor;
    }
    if ((!authorText || isPublicationName(authorText)) && primaryBioName) {
      authorText = primaryBioName;
    }

    return {
      titleEl, mainEl, commentEls,
      extraRemove: rules?.extraRemove || '',
      authorBioEls: bioEls,
      authorText, authorBios: dedupBios,
      safeKeep: rules?.safeKeep || '',
      disable: Array.isArray(rules?.disable) ? rules.disable : [],
      rulesMatchedHost
    };
  }
}
