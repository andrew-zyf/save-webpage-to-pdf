// Auto-generated combined flow file. Idempotent — safe to inject multiple times.
if (!window.__a4lpStart) (function () {
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
    extraRemove: [
      '[data-component-name*="related" i]',
      '[data-component-name*="newsletter" i]',
      '[data-component-name*="recommended" i]',
      // 严格白名单：只杀明确是 推荐/广告/最新/最热/订阅 的 zone。
      // `zone-cards / zone-link / zone-content-cards` 等都可能是内容区，绝不再泛匹配。
      '[data-component-name="zone-related"]', '[data-component-name="zone-recommended"]',
      '[data-component-name="zone-trending"]', '[data-component-name="zone-most-popular"]',
      '[data-component-name="zone-most-watched"]', '[data-component-name="zone-newsletter"]',
      '[data-component-name="zone-advertisement"]', '[data-component-name="zone-ads"]',
      '[class*="zone__items--related" i]', '[class*="zone__items--recommend" i]',
      '.ad-slot', '[data-uri*="ads"]',
      '[class*="related-content"]', '[class*="paid-partner"]', '[class*="related-articles"]'
    ].join(', ')
  },
  'csis.org': {
    // CSIS commentary 页面：作者卡通常在正文上方（.commentary-authors / .expert-card）
    // 或在 sidebar（.expert-bio-sidebar）。两处都抓，去重后重排版。
    main: 'article, .field--name-body, .node__content, main',
    title: 'h1',
    author: '.commentary-authors a, .expert-card .expert-name, .field--name-field-experts a, .expert-name, [class*="byline"]',
    authorBio: '.commentary-authors .expert-card, .commentary-authors article, .expert-card, .expert-bio-sidebar, .field--name-field-experts > .field__item, [class*="contributor-bio"], [class*="contributor-info"]',
    extraRemove: [
      '.related-content', '.expert-bio-sidebar', '.field--name-field-experts',
      '.program-card', '.social-share', '.views-element-container', '.region-sidebar',
      '.commentary-authors',
      // 文末 Tags / Related Content / 版权声明 / Critical Questions 简介
      '.field--name-field-tags', '[class*="tags-list" i]', '[class*="tag-list" i]',
      '.field--name-field-related', '.related-content-block', '[class*="more-from" i]',
      '.copyright', '[class*="copyright" i]', '[class*="legal" i]',
      '[class*="program-info" i]', '[class*="series-info" i]'
    ].join(', ')
  },
  'economist.com': {
    main: 'article, [data-test-id="Article"], main',
    title: 'h1',
    // Economist 多数文章不署个人作者；给较宽的候选 + meta 兜底已在 popup 通用流程里
    author: '[data-test-id*="byline" i], [data-test-id*="Byline" i], [class*="byline" i], [class*="Byline" i], [rel="author"], [itemprop="author"]',
    authorBio: '[data-test-id*="author-bio"], [class*="author-bio"], [class*="contributor-bio"]',
    extraRemove: '[data-test-id*="newsletter"], [data-test-id*="related"], [data-test-id*="audio"], [data-test-id*="recommend"], [data-test-id*="myft"], [class*="podcast"], [class*="newsletter-signup"], [class*="paywall"]'
  },
  'foreignaffairs.com': {
    main: 'article.article, [class*="article__body"], .article-body, .article-content, article, main',
    title: 'h1.topper__title, h1',
    author: '.topper__byline, .article-byline, [class*="byline"]',
    authorBio: '[class*="author-bio"], [class*="contributor-bio"], [class*="AuthorBio"], .article__author-info',
    extraRemove: [
      '.article-tools', '.article__related', '.article__most_read', '.article-tags',
      '.promo-callout', '.article-actions', '.related-articles', '.recirculation',
      '.related-content', '.promo-block',
      '[class*="newsletter"]', '[class*="paywall-promo"]', '[class*="audio-player"]',
      '[class*="article-callout"]', '[data-armstrong-id="wrapper"]',
      // FA 文末"More by 作者名"链接 widget —— 容器/链接/直接 by-author 链接三种命名
      '[class*="more-by" i]', '[class*="MoreBy" i]', '[class*="ContributorMoreBy" i]',
      '[class*="author-link" i]', '[class*="AuthorLink" i]',
      // FA 把这些 widget 普遍包成 a[href^="/author/"] 或 a[href*="/anonymous/"]
      '.article a[href^="/author/" i]', '.article a[href*="/anonymous/" i]',
      'article a[href^="/author/" i]', 'article a[href*="/anonymous/" i]'
    ].join(', ')
  },
  'newyorker.com': {
    // 取整个 <article>，避免钉死内层后正文被截断（NY 正文常被切到多个
    // .body__inner-container 段）；末尾的 recirc/newsletter/footer 模块由 extraRemove 兜底。
    main: 'article, main article, [data-attribute-verso-pattern="article-body"], [class*="ArticleBodyWrapper"], [class*="BodyWrapper"], main',
    title: 'h1',
    author: '[class*="BylineWrapper"], [data-testid*="Byline" i], [class*="Byline"], [class*="byline"]',
    authorBio: '[class*="ContributorBio"], [class*="ContributorBlock"], [class*="contributor-bio"]',
    extraRemove: [
      // Listen 控件 —— 文本启发式不稳，直接用结构选择器删
      '[class*="ListenButton" i]', '[class*="listen-button" i]', '[class*="AudioControls" i]',
      '[class*="Listen" i][class*="Wrapper" i]', '[class*="Listen" i][class*="Bar" i]',
      '[data-testid*="listen" i]', '[aria-label*="Listen to" i]', '[aria-label*="Play audio" i]',
      'button[aria-label*="Listen" i]', 'button[aria-label*="Play" i]',
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
  // 兜底回滚上一次中断打印遗留的临时 DOM 改动（loading="eager" 的原值已无法
  // 还原，但至少保证 details / a4lp-data-* 不会一直挂着）
  document.querySelectorAll('details[data-a4lp-opened="1"]').forEach(d => {
    d.removeAttribute('data-a4lp-opened');
    d.open = false;
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
    d.setAttribute('data-a4lp-opened', '1');
    d.open = true;
  });
  if (openedDetails.length) {
    cleanupActions.push(() => {
      openedDetails.forEach(d => {
        if (!d.isConnected) return;
        d.removeAttribute('data-a4lp-opened');
        d.open = false;
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

  // 0b'. 兜底懒加载占位：很多站点（Economist / NYT / FT / CNN 等）只在
  // data-src / data-srcset / data-original / data-hi-res-src 上挂真实 URL，
  // 等 IO 触发才 swap。无条件把 data-* 上能找到的真实 URL 回填到 src/srcset
  // —— 即使现有 src 看起来正常，我们也宁愿强制刷新以保证打印之前请求已发出。
  const LAZY_DATA_SRC_KEYS = ['data-src', 'data-lazy-src', 'data-original', 'data-hi-res-src', 'data-fallback-src', 'data-image'];
  const LAZY_DATA_SRCSET_KEYS = ['data-srcset', 'data-lazy-srcset', 'data-original-srcset'];
  document.querySelectorAll('img').forEach(img => {
    let realSrc = '';
    for (const k of LAZY_DATA_SRC_KEYS) {
      const v = img.getAttribute(k);
      if (v && !/^data:image\/(?:gif|svg\+xml);/i.test(v)) { realSrc = v; break; }
    }
    let realSrcset = '';
    for (const k of LAZY_DATA_SRCSET_KEYS) {
      const v = img.getAttribute(k);
      if (v) { realSrcset = v; break; }
    }
    // 简化的 srcset 取最大候选（在 pickBestFromSrcset 还没定义前用），用来给
    // <picture><source data-srcset> 推一个保底真实 URL 落到 img.src 上。
    const firstUrlFromSrcset = (s) => {
      if (!s) return '';
      const parts = s.split(',').map(t => t.trim()).filter(Boolean);
      if (!parts.length) return '';
      let best = parts[0], bestW = 0;
      for (const p of parts) {
        const [u, d] = p.split(/\s+/);
        const w = d && d.endsWith('w') ? parseInt(d, 10) : 0;
        if (w > bestW) { bestW = w; best = p; }
      }
      return best.split(/\s+/)[0] || '';
    };
    const pic = img.closest('picture');
    if (pic) {
      pic.querySelectorAll('source').forEach(source => {
        for (const k of LAZY_DATA_SRCSET_KEYS) {
          const v = source.getAttribute(k);
          if (!v) continue;
          if (source.getAttribute('srcset') !== v) {
            rememberAttr(source, 'srcset');
            source.setAttribute('srcset', v);
          }
          if (!realSrcset) realSrcset = v;
          if (!realSrc) {
            const picked = firstUrlFromSrcset(v);
            if (picked) realSrc = picked;
          }
          break;
        }
      });
    }
    const currentLooksBroken = !img.currentSrc ||
      /^data:image\/(?:gif|svg\+xml);/i.test(img.currentSrc) ||
      (img.complete && img.naturalWidth > 0 && img.naturalWidth <= 4 && img.naturalHeight <= 4);
    if (realSrc && (currentLooksBroken || !img.getAttribute('src') || /^data:image\/(?:gif|svg\+xml);/i.test(img.getAttribute('src') || ''))) {
      rememberAttr(img, 'src');
      img.src = realSrc;
    }
    if (realSrcset && (currentLooksBroken || !img.getAttribute('srcset'))) {
      if (img.hasAttribute('srcset')) rememberAttr(img, 'srcset');
      img.setAttribute('srcset', realSrcset);
    }
  });

  await withTimeout(
    Promise.all(Array.from(document.images).map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return withTimeout(new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }), 3500);
    })),
    9000
  );
  // 二次兜底：仅对"已加载完成且失败"的 <img>（complete=true 且 naturalWidth=0）
  // 才尝试回退；正在加载中的图（complete=false）继续等下一轮，绝不能在 in-flight
  // 时清掉 <source srcset>，否则会把本来快要成功的图也打废。
  // 同时只清那些 srcset 跟 img.src 不同的 <source>（说明走了不同候选），并要求
  // img.src 是真实 URL（非 data: 占位）。
  const stillBroken = Array.from(document.images).filter(img => img.complete && img.naturalWidth === 0);
  if (stillBroken.length) {
    stillBroken.forEach(img => {
      const cur = img.getAttribute('src') || '';
      const hasRealSrc = cur && !/^data:image\/(?:gif|svg\+xml);/i.test(cur);
      if (!hasRealSrc) return;
      const pic = img.closest('picture');
      if (pic) {
        pic.querySelectorAll('source[srcset]').forEach(source => {
          if ((source.getAttribute('srcset') || '').includes(cur)) return;
          rememberAttr(source, 'srcset');
          source.setAttribute('srcset', '');
        });
      }
      img.removeAttribute('src');
      img.setAttribute('src', cur);
    });
    await withTimeout(
      Promise.all(stillBroken.map(img => withTimeout(new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }), 3000))),
      5000
    );
  }

  // 0e. 字节内联：把所有图片 fetch 成 blob 后写到 img.src，从根本上消除
  // 懒加载、CORS preflight、<picture> codec 选择这些不确定性。fetch 在
  // 页面 origin 上下文里跑，自动带 cookie；得到的 blob URL 已经是本地数据，
  // Skia 打印时不会再重新去网络拉。
  const inlineImage = async (img) => {
    // 已经正常加载的图：完全不动 —— 之前会清掉 srcset 强制回退到 img.src，
    // 但很多站点（WSJ/CSIS 等）img.src 是占位 1×1 gif，srcset 才指向真图，
    // 一清就让 currentSrc 退回到占位，naturalWidth=1，被 0f 当失败图隐藏掉。
    if (img.complete && img.naturalWidth >= 50) return;
    const tryUrls = [];
    const push = (u) => {
      if (!u) return;
      if (/^data:image\/(?:gif|svg\+xml);/i.test(u)) return;
      try { tryUrls.push(new URL(u, document.baseURI).href); } catch {}
    };
    push(img.currentSrc);
    push(img.src);
    for (const k of LAZY_DATA_SRC_KEYS) push(img.getAttribute(k));
    const pic = img.closest('picture');
    if (pic) {
      pic.querySelectorAll('source[srcset]').forEach(s => {
        const ss = s.getAttribute('srcset') || '';
        const first = ss.split(',')[0].trim().split(/\s+/)[0];
        push(first);
      });
    }
    let blob = null;
    for (const url of [...new Set(tryUrls)]) {
      try {
        const r = await Promise.race([
          fetch(url, { credentials: 'include' }),
          new Promise((_, rej) => setTimeout(() => rej('timeout'), 3500))
        ]);
        if (!r || !r.ok) continue;
        const b = await r.blob();
        if (b && b.size > 200 && /^image\//i.test(b.type || '')) { blob = b; break; }
      } catch {}
    }
    if (!blob) return;
    const blobUrl = URL.createObjectURL(blob);
    cleanupActions.push(() => { try { URL.revokeObjectURL(blobUrl); } catch {} });
    if (pic) {
      pic.querySelectorAll('source').forEach(s => {
        rememberAttr(s, 'srcset');
        s.setAttribute('srcset', '');
      });
    }
    rememberAttr(img, 'src');
    if (img.hasAttribute('srcset')) { rememberAttr(img, 'srcset'); img.setAttribute('srcset', ''); }
    img.src = blobUrl;
    try { await img.decode(); } catch {}
  };
  // 控制并发与总数，防止超大文章拖太久（封顶 40 张 / 单张 4s）
  const allImgs = Array.from(document.images).slice(0, 40);
  await withTimeout(
    Promise.all(allImgs.map(img => withTimeout(inlineImage(img), 4000))),
    18000
  );

  // 0f. 仍然失败的图片：只清"内容图"容器（figure / picture / .a4lp-keep）。
  // 不动游离 <img>（可能是装饰小图标），也不动已经正常加载的图。
  document.querySelectorAll('img').forEach(img => {
    const wrap = img.closest('figure, picture, .a4lp-keep');
    if (!wrap) return;
    if (img.complete && img.naturalWidth >= 16) return;
    wrap.classList.add('a4lp-hide');
  });

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
  const isCSIS = rulesMatchedHost === 'csis.org';
  const normalizeText = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const leadBodyP = mainEl ? Array.from(mainEl.querySelectorAll('p')).find(p => {
    const text = normalizeText(p.innerText || p.textContent || '');
    return text.length >= 100 && !/^(by\b|updated\b|listen\b|story by\b|more by\b|photo illustration by\b)/i.test(text);
  }) : null;
  const leadBodyTop = leadBodyP?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
  const FRONT_MATTER_TEXT = [
    ...(isCNN ? [/^UPDATED\b/i, /^Story by\b/i] : []),
    ...(isNY ? [/^Comment$/i, /^By\s+[A-Z]/, /^[A-Z][a-z]+\s+\d{1,2},\s+\d{4}$/i, /^Photo illustration by\b/i,
                // Listen 控件文本前常带播放图标字符（▶ ▷ ► ◇ 或别的私有区图标），
                // 因此允许任意 0-3 个非字母前缀字符再接 "Listen"
                /^[^A-Za-z0-9]{0,3}\s*Listen(?:\s*[•·|]\s*\d+\s*(?:min(?:ute)?s?|sec(?:ond)?s?))?\s*$/i] : []),
    ...(isFA ? [/^More by\b/i] : [])
  ];
  const TAIL_START_TEXT = [
    ...(isEconomist ? [/^Explore more$/i, /^For more on the latest\b/i, /^This article appeared in the .* print edition\b/i, /^From the .* edition$/i, /^Discover stories from this section\b/i, /^⇒?\s*Explore the edition$/i, /^More from [A-Z]/i] : []),
    ...(isCarnegie && layoutMode === 'reading' ? [/^Acknowledgments$/i, /^About the Author$/i, /^Notes$/i, /^More Work from Carnegie Endowment for International Peace$/i] : []),
    ...(isCarnegie && layoutMode === 'archive' ? [/^More Work from Carnegie Endowment for International Peace$/i] : []),
    // FA：只匹配 "More by ..." 锚点。之前用 "Firstname Lastname is/holds/..."
    // 启发式会误伤正文中引用专家的段落（FA 经常这么写），导致整篇被裁掉。
    ...(isFA ? [/^More by\b/i] : []),
    // CSIS：文末固定有 Tags / Related Content / 版权声明
    ...(isCSIS ? [/^Tags$/i, /^Related Content$/i, /^© \d{4} by the Center for Strategic and International Studies/i, /^Critical Questions is produced by the Center for Strategic/i] : [])
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
    if (/^(related content|recommended reading|see also|recirculation|recommendation|read next|what to read next|more to read)$/i.test(text)) return true;
    if (/^(explore more|from the .* edition|discover stories from this section|more from [a-z].*|plot twist newsletter\b|this article appeared in the .* print edition|more work from carnegie endowment for international peace|acknowledgments|about the author|notes|more by\b|[^A-Za-z0-9]{0,3}\s*listen(?:\s*[•·|]\s*\d+\s*(?:min(?:ute)?s?|sec(?:ond)?s?))?)$/i.test(text)) return true;
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
  // 头/尾允许出现的"装饰性碎片"：数字、间隔符号、以及 "N min/sec(s)" 时长后缀
  // （NY 的 "Listen • 7 minutes" 就靠这个时长后缀通过）
  const ACTION_DECOR = '(?:[\\d\\s·•|·▶▷►◇]+|\\d+\\s*(?:min(?:ute)?s?|sec(?:ond)?s?|hr|hour|hours))';
  const ACTION_RE = new RegExp(
    '^(\\s*' + ACTION_DECOR + '\\s*)*' +
    '(收听本文|收听|朗读|播放音频|播放|打印本页|打印|存档|收藏本文|收藏|分享到|分享|订阅|关注|举报|纠错|点赞|喜欢|转发|复制链接|复制|加入书签|查看原文|english version|繁體|简体|' +
    'listen(?:\\s+to\\s+(?:this\\s+)?(?:article|story))?|listen now|play(?:\\s+audio)?|' +
    'print(?:\\s+(?:this\\s+)?(?:page|article|story))?|archive(?:d)?|' +
    'save(?:\\s+(?:this\\s+)?(?:story|article|for\\s+later))?|saved|bookmark|' +
    'share(?:\\s+(?:this|article|story|on\\s+\\w+))?|copy\\s+link|subscribe|follow|report|like|' +
    'gift(?:\\s+(?:this\\s+)?article)?)' +
    '(\\s*' + ACTION_DECOR + '\\s*)*$',
    'i'
  );
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
    if (!patterns.length || !Number.isFinite(leadBodyTop)) return;
    // 同时扫 mainEl 与 titleEl 的 header/article 祖先 —— CNN/NY 的 UPDATED /
    // Story by / Listen 等元信息常挂在文章 header 而不是正文容器里。
    const scopes = new Set();
    if (mainEl) scopes.add(mainEl);
    const titleScope = titleEl?.closest('header, article, main, section');
    if (titleScope) scopes.add(titleScope);
    if (!scopes.size) return;
    const seen = new WeakSet();
    scopes.forEach(scope => {
      scope.querySelectorAll('p, div, span, small, h2, h3, h4, section, header, figure, figcaption, li, time, button, a[role="button"]').forEach(el => {
        if (seen.has(el)) return;
        seen.add(el);
        if (isSafe(el) || el.closest('.a4lp-hide')) return;
        const rect = el.getBoundingClientRect();
        if (!rect.height || rect.bottom > leadBodyTop + 48) return;
        const text = normalizeText(el.innerText || el.textContent || '');
        if (!text || text.length > 500) return;
        if (!patterns.some(re => re.test(text))) return;
        bubbleHideTarget(el).classList.add('a4lp-hide');
      });
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
    const mainRect = mainEl.getBoundingClientRect();
    // 标记节点必须落在 mainEl 下半部 —— 否则像 FA 文章顶部的 "More by …"
    // 侧边栏会被当成 tail anchor，把整篇正文都裁掉。
    const lowerCutoff = mainRect.top + Math.max(200, mainRect.height * 0.45);
    const candidates = Array.from(mainEl.querySelectorAll('h1, h2, h3, h4, p, div, section, aside, li')).filter(el => {
      if (isSafe(el) || el.closest('.a4lp-hide')) return false;
      if (!isAfterLeadBody(el)) return false;
      const rect = el.getBoundingClientRect();
      if (!rect.height || rect.top < lowerCutoff) return false;
      const text = normalizeText(el.innerText || el.textContent || '');
      if (!text || text.length > 600) return false;
      return patterns.some(re => re.test(text));
    });
    // 优先采用 DOM 顺序中靠前的一个（即最早进入下半部的 marker），
    // 这样多个相邻噪声块都能被一起带走。
    if (candidates.length) hideFromNodeToEnd(candidates[0]);
  };
  if (FRONT_MATTER_TEXT.length) hideLeadMatches(FRONT_MATTER_TEXT);
  if (TAIL_START_TEXT.length) stripFromMarker(TAIL_START_TEXT);

  // 5d. 邻近段落"半字重复"修复：Economist 等站点会把同一段落渲染两次（一份正常、
  // 一份用缺失下行字符的字体或漏渲染），打印后并列出现 "ou marshal not merel ords"
  // 紧挨 "you marshal not merely words"。规则：mainEl 内同 parent 的两段
  // <p>，若一段是另一段的"破损子集"（长度短 ≥ 6 字符且非空字符在另一段中
  // 严格按序出现，重叠率 ≥ 75%），则隐藏短的那个。
  if (mainEl) {
    const isSubsequenceOverlap = (short, long) => {
      if (!short || !long || short.length < 6) return 0;
      if (long.length < short.length) return 0;
      let i = 0, hits = 0;
      const s = short.toLowerCase().replace(/\s+/g, '');
      const l = long.toLowerCase().replace(/\s+/g, '');
      if (!s.length) return 0;
      for (const ch of l) {
        if (i < s.length && ch === s[i]) { i++; hits++; }
      }
      return hits / s.length;
    };
    const paras = Array.from(mainEl.querySelectorAll('p')).filter(p => {
      if (isSafe(p) || p.closest('.a4lp-hide')) return false;
      const t = normalizeText(p.innerText || p.textContent || '');
      return t.length >= 20 && t.length <= 1200;
    });
    for (let i = 0; i < paras.length - 1; i++) {
      const a = paras[i], b = paras[i + 1];
      // 不再要求 parentNode 完全相同：ghost 副本常被包在 <aside> /
      // <div role="presentation"> 等不同祖先里。两段在 mainEl 内、DOM 顺序紧邻即可。
      const ta = normalizeText(a.innerText || a.textContent || '');
      const tb = normalizeText(b.innerText || b.textContent || '');
      if (!ta || !tb) continue;
      const [shortEl, longEl, shortText, longText] = ta.length <= tb.length ? [a, b, ta, tb] : [b, a, tb, ta];
      if (longText.length - shortText.length < 4) continue;
      const overlap = isSubsequenceOverlap(shortText, longText);
      if (overlap >= 0.75) {
        shortEl.classList.add('a4lp-hide');
      }
    }
  }
  // 5d.5 全局 Listen 兜底（前缀匹配 + 必须含数字 + 短文本，children 限制取消，
  // 兼容 ZWSP/NBSP 等怪异空白；定义为函数 sweepListen 以便末尾再扫一次。）
  const LISTEN_PREFIX_RE = /^[^A-Za-z0-9]{0,3}\s*Listen\b/i;
  const sweepListen = () => {
    // 全节点扫描（不限标签）—— NY 的 Listen 控件可能是 <verso-listen-button>
    // 或 ::before content 注入文本，常规标签匹配不到。
    const norm = (s) => (s || '').replace(/[\s​‌‍ ]+/g, ' ').trim();
    const ownText = (el) => {
      let t = '';
      for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
      return norm(t);
    };
    const fullText = (el) => norm(el.innerText || el.textContent || '');
    const matchesListen = (s) => !!s && s.length <= 50 && LISTEN_PREFIX_RE.test(s) && /\d/.test(s);
    document.querySelectorAll('body *').forEach(el => {
      if (isSafe(el) || el.closest('.a4lp-hide')) return;
      const ft = fullText(el);
      if (ft.length > 200) return;
      const ot = ownText(el);
      let hit = matchesListen(ot) || (matchesListen(ft) && el.children.length <= 6);
      if (!hit) {
        try {
          const stripQuote = (s) => (s || '').replace(/^['"]|['"]$/g, '').trim();
          const before = stripQuote(getComputedStyle(el, '::before').content);
          const after  = stripQuote(getComputedStyle(el, '::after').content);
          if (matchesListen(before) || matchesListen(after)) hit = true;
        } catch {}
      }
      if (!hit) return;
      let target = el;
      for (let i = 0; i < 3; i++) {
        const p = target.parentElement;
        if (!p || p === document.body || isSafe(p)) break;
        const pText = norm(p.innerText || '');
        const baseLen = Math.max(ft.length, ot.length, 16);
        if (pText.length <= baseLen + 120) target = p; else break;
      }
      target.classList.add('a4lp-hide');
    });
  };
  sweepListen();



  // 5d.6 ghost 文本进阶兜底：扫 mainEl 内"短文本叶子"，找 Y 区间重叠且子序列
  // 相似度 ≥ 0.75 的两块，隐藏更短/更破损的（Economist `ou marshal not merel
  // ords` 这种破损 ghost 不一定是 <p>，也未必同 parentNode）。
  if (mainEl) {
    const textLeaves = Array.from(mainEl.querySelectorAll('p, div, li, span, blockquote'))
      .filter(el => {
        if (isSafe(el) || el.closest('.a4lp-hide')) return false;
        if (el.querySelector('p, div, li, blockquote')) return false;
        const t = normalizeText(el.innerText || el.textContent || '');
        return t.length >= 30 && t.length <= 1500;
      })
      .map(el => {
        const r = el.getBoundingClientRect();
        return { el, top: r.top, bottom: r.bottom, text: normalizeText(el.innerText || el.textContent || '') };
      })
      .filter(x => x.bottom > x.top);
    const subseqOverlap = (a, b) => {
      if (!a || !b) return 0;
      const sShort = (a.length <= b.length ? a : b).toLowerCase().replace(/\s+/g, '');
      const sLong  = (a.length <= b.length ? b : a).toLowerCase().replace(/\s+/g, '');
      if (sShort.length < 12) return 0;
      let i = 0, hits = 0;
      for (const ch of sLong) if (i < sShort.length && ch === sShort[i]) { i++; hits++; }
      return hits / sShort.length;
    };
    for (let i = 0; i < textLeaves.length; i++) {
      for (let j = i + 1; j < textLeaves.length && j <= i + 8; j++) {
        const A = textLeaves[i], B = textLeaves[j];
        const yGap = Math.max(A.top - B.bottom, B.top - A.bottom);
        if (yGap > 6) break;
        const overlap = subseqOverlap(A.text, B.text);
        if (overlap < 0.75) continue;
        const shorter = A.text.length <= B.text.length ? A.el : B.el;
        shorter.classList.add('a4lp-hide');
      }
    }
  }
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

  // 7a-pre. 找一张封面 hero 图：扫描范围扩展到 mainEl 的 <article> 祖先，
  // 而不是仅 mainEl —— CNN 等站点把真正的现场照片放在 .article__content-container
  // 之外（例如 .article__hero），mainEl 扫不到，结果只剩文末的 cnn-fallback-image.jpg
  // 被当成 hero。同时把 fallback / default / share-image / og-image 等
  // 站点占位图明确加入黑名单。
  let coverHeroSrc = '';
  let coverHeroEl = null;
  const HERO_REJECT_RE = /(logo|icon|avatar|sprite|placeholder|pixel|tracker|spacer|blank|fallback|default[-_]?image|share[-_]?image|og[-_]?image|opengraph|cnn-?fallback|brand[-_]?image|generic[-_]?image)/i;
  const heroSearchScope = (mainEl?.closest('article')) || document.querySelector('article, main') || mainEl;
  if (heroSearchScope) {
    const heroCandidate = Array.from(heroSearchScope.querySelectorAll('img')).find(img => {
      if (img.closest('.a4lp-hide')) return false;
      if (!img.complete || img.naturalWidth < 240 || img.naturalHeight < 160) return false;
      const aspect = img.naturalWidth / img.naturalHeight;
      if (aspect < 0.4 || aspect > 4.5) return false;
      const src = img.currentSrc || img.src;
      if (!src || /^data:image\/(?:gif|svg\+xml);/i.test(src)) return false;
      const hint = (src + ' ' + (img.alt || '') + ' ' + (img.className || '') + ' ' + ((img.parentElement && img.parentElement.className) || '')).toLowerCase();
      if (HERO_REJECT_RE.test(hint)) return false;
      return true;
    });
    if (heroCandidate) {
      coverHeroSrc = heroCandidate.currentSrc || heroCandidate.src;
      coverHeroEl = heroCandidate;
    }
  }
  // 同时把所有 fallback/占位图全局隐藏 —— 它们不该出现在正文里污染版面
  document.querySelectorAll('img').forEach(img => {
    const src = img.currentSrc || img.src || '';
    if (!src) return;
    const hint = (src + ' ' + (img.alt || '') + ' ' + (img.className || '') + ' ' + ((img.parentElement && img.parentElement.className) || '')).toLowerCase();
    if (HERO_REJECT_RE.test(hint) && !/(logo|icon)\s*$/i.test(img.alt || '')) {
      const wrap = img.closest('figure, picture, .a4lp-keep') || img;
      wrap.classList.add('a4lp-hide');
    }
  });

  // 7a. 封面页 / 阅读版抬头
  let html = '<section class="a4lp-cover a4lp-cover--' + layoutMode + '">' +
    '<div class="a4lp-cover-kicker">' +
      (layoutMode === 'archive' ? 'SAVED WEBPAGE · ' + escapeHtml(dateStr) : 'READING COPY · ' + escapeHtml(dateStr)) +
    '</div>' +
    (titleText ? '<h1 class="a4lp-cover-title">' + escapeHtml(titleText) + '</h1>' : '') +
    (authorText ? '<div class="a4lp-cover-by">BY ' + escapeHtml(authorText) + '</div>' : '') +
    (coverHeroSrc ? '<div class="a4lp-cover-hero"><img src="' + escapeHtml(coverHeroSrc) + '" alt="" loading="eager" decoding="sync" fetchpriority="high"></div>' : '');

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
  const TOC_BLACKLIST_RE = /^(related content|recommended reading|see also|recirculation|recommendation|read next|what to read next|more to read|more from [a-z].*|more work from\b|explore more|tags?|share this|sign up|subscribe|newsletter|comments?|related articles?|further reading)$/i;
  const headings = mainEl ? Array.from(mainEl.querySelectorAll('h1, h2, h3')).filter(h => {
    if (h === titleEl) return false;
    if (h.closest('.a4lp-hide')) return false;
    if (isSupplementalNode(h)) return false;
    const text = (h.innerText || '').trim();
    if (!text) return false;
    if (TOC_BLACKLIST_RE.test(text)) return false;
    return true;
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

  // 7d. 隐藏正文中的原 <h1> + 已经搬上封面的 hero 图，避免与封面重复
  if (coverHeroEl) {
    const wrap = coverHeroEl.closest('figure, picture, .a4lp-keep') || coverHeroEl;
    wrap.classList.add('a4lp-hide');
  }
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

  // 等封面 hero 图解码完（缓存命中通常 < 50ms，但 cold cache 时也要等）
  const coverImg = insertHost.querySelector('.a4lp-cover-hero img');
  if (coverImg) {
    try { await withTimeout(coverImg.decode(), 2000); } catch {}
  }
  await sleep(300);
  // 末尾再扫一次 Listen —— 站点的延迟挂载组件（NY verso-listen-button 等）
  // 经常在我们第一次扫之后才挂到 DOM。
  if (typeof sweepListen === 'function') sweepListen();
  window.addEventListener('afterprint', cleanup, { once: true });
  window.print();
  setTimeout(cleanup, 0);

  // ---- 内嵌 helper ----
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
      // 站点栏目前缀（CSIS "Critical Questions by ..."、Carnegie "Commentary by ..." 等）
      .replace(/^\s*(critical questions|commentary|analysis|brief(?:ing)?|report)\s+by\s+/i, '')
      // 文末发表日期 / "Published Month D, YYYY"
      .replace(/\s*[|•·]?\s*published\b.*$/i, '')
      .replace(/\s*[|•·]?\s*[A-Z][a-z]+\s+\d{1,2},\s*\d{4}.*$/, '')
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
window.__a4lpStart = (options = {}) => pdfFlow(SITE_RULES, options || {});
})();
