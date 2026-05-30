// Main content-extraction + print-pipeline for the Save WSJ Webpage to PDF
// extension. Wrapped in IIFE for safe multi-inject — each call overwrites
// window.__a4lpStart so stale closures from a previous extension load are
// replaced.
(function () {
// ---- 站点规则白名单（按 host 字母序） ----
const SITE_RULES = {
  'wsj.com': {
    main: 'article[itemtype*="NewsArticle"], article, main article, section[subscriptions-section="content"], [data-module-id*="ArticleBody"], article[itemtype*="NewsArticle"] section.article-content, [class*="ArticleBody-module"] section, article section.article-content',
    title: 'h1[itemprop="headline"], h1',
    author: '[itemprop="author"], [class*="Byline"], [class*="byline"]',
    authorBio: '[class*="author-bio"], [class*="AuthorBio"], [data-module-id*="author-bio"], [class*="bylineBio"]',
    comments: '[id*="spotim"], [class*="spotim"], [data-spotim-module], [id^="conversation"], [id^="sp_message"]',
    safeKeep: [
      'article[itemtype*="NewsArticle"] figure:has(img)',
      'article[itemtype*="NewsArticle"] picture:has(img)',
      'article[itemtype*="NewsArticle"] [role="figure"]:has(img)',
      'article[itemtype*="NewsArticle"] [data-module-id*="image" i]:has(img)',
      'article[itemtype*="NewsArticle"] [data-module-id*="photo" i]:has(img)',
      'article[itemtype*="NewsArticle"] [class*="ResponsiveThumbnail" i]:has(img)',
      'article[itemtype*="NewsArticle"] [class*="Image" i]:has(img)',
      'article[itemtype*="NewsArticle"] [class*="image" i]:has(img)',
      'article[itemtype*="NewsArticle"] [class*="Media" i]:has(img)',
      'article[itemtype*="NewsArticle"] [class*="media" i]:has(img)'
    ].join(', '),
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
      '[class*="VideoCarousel" i]',
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
  const PRINT_CLEANUP_FALLBACK_MS = 120000;
  const layoutMode = 'archive';
  // 处理上一次打印异常留下的注入节点，避免封面/目录重复叠加。
  document.querySelectorAll('.a4lp-source').forEach(el => el.remove());
  document.querySelectorAll('.a4lp-hide').forEach(el => el.classList.remove('a4lp-hide'));
  document.querySelectorAll('.a4lp-safe').forEach(el => el.classList.remove('a4lp-safe'));
  document.querySelectorAll('.a4lp-svg-icon, .a4lp-svg-graphic').forEach(el => {
    el.classList.remove('a4lp-svg-icon', 'a4lp-svg-graphic');
  });
  document.documentElement.classList.remove('a4lp-print-root');
  document.body.classList.remove('a4lp-print-root', 'a4lp-mode-archive', 'a4lp-reconstructed');
  Array.from(document.body.classList).forEach(cls => {
    if (cls.startsWith('a4lp-site-')) document.body.classList.remove(cls);
  });
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
  const DATA_PLACEHOLDER_RE = /^data:image\/gif/i;
  const DATA_SVG_IMAGE_RE = /^data:image\/svg\+xml/i;
  const PLACEHOLDER_IMAGE_RE = /(placeholder|pixel|tracker|spacer|blank|fallback|default[-_]?image|generic[-_]?image|transparent)/i;
  const DECORATIVE_IMAGE_RE = /(logo|icon|avatar|sprite|brand[-_]?image)/i;
  const GRAPHIC_IMAGE_RE = /(chart|graph|table|diagram|infographic|map|equation|formula|qr|barcode|screenshot|code)/i;
  const LAZY_DATA_SRC_KEYS = ['data-src', 'data-lazy-src', 'data-original', 'data-hi-res-src', 'data-fallback-src', 'data-image'];
  const LAZY_DATA_SRCSET_KEYS = ['data-srcset', 'data-lazy-srcset', 'data-original-srcset'];
  const getImageHint = (img, src) => [
    src,
    img?.alt || '',
    img?.getAttribute?.('aria-label') || '',
    img?.className && typeof img.className === 'string' ? img.className : '',
    img?.closest?.('figure')?.className || '',
    img?.closest?.('picture')?.className || '',
    img?.parentElement?.className && typeof img.parentElement.className === 'string' ? img.parentElement.className : ''
  ].join(' ').toLowerCase();
  const isLikelyPlaceholderImage = (img, src = '') => {
    const current = src || img?.currentSrc || img?.src || '';
    const hint = getImageHint(img, current);
    const w = img?.naturalWidth || parseFloat(img?.getAttribute?.('width') || '0') || 0;
    const h = img?.naturalHeight || parseFloat(img?.getAttribute?.('height') || '0') || 0;
    if (DATA_PLACEHOLDER_RE.test(current) && !GRAPHIC_IMAGE_RE.test(hint)) return true;
    if (DATA_SVG_IMAGE_RE.test(current) && !GRAPHIC_IMAGE_RE.test(hint) && w > 0 && h > 0 && w <= 2 && h <= 2) return true;
    if (w > 0 && h > 0 && w <= 2 && h <= 2 && !GRAPHIC_IMAGE_RE.test(hint)) return true;
    return PLACEHOLDER_IMAGE_RE.test(hint);
  };
  const absolutizeImageUrl = (value) => {
    if (!value || DATA_PLACEHOLDER_RE.test(value)) return '';
    try { return new URL(value, document.baseURI).href; } catch { return ''; }
  };
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
  const pickLargestFromSrcset = (srcset) => {
    const candidates = parseSrcset(srcset);
    if (!candidates.length) return '';
    const sorted = [...candidates].sort((a, b) => (a.width || a.density) - (b.width || b.density));
    return sorted[sorted.length - 1].url || '';
  };
  const getBestImageUrl = (img) => {
    const push = (urls, value) => {
      const url = absolutizeImageUrl(value);
      if (url) urls.push(url);
    };
    const urls = [];
    push(urls, img?.currentSrc);
    push(urls, img?.src);
    if (img?.hasAttribute?.('srcset')) push(urls, pickBestFromSrcset(img.getAttribute('srcset'), img));
    for (const k of LAZY_DATA_SRC_KEYS) push(urls, img?.getAttribute?.(k));
    const pic = img?.closest?.('picture');
    if (pic) {
      pic.querySelectorAll('source').forEach(source => {
        const srcset = source.getAttribute('srcset') || source.getAttribute('data-srcset') || source.getAttribute('data-lazy-srcset') || '';
        push(urls, pickBestFromSrcset(srcset, img) || pickLargestFromSrcset(srcset));
      });
    }
    return [...new Set(urls)].find(url => !isLikelyPlaceholderImage(img, url)) || '';
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
    const currentLooksBroken = isLikelyPlaceholderImage(img) ||
      !img.currentSrc ||
      DATA_PLACEHOLDER_RE.test(img.currentSrc) ||
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
    if (img.complete && img.naturalWidth >= 50 && !isLikelyPlaceholderImage(img)) return;
    const tryUrls = [];
    const push = (u) => {
      if (!u) return;
      if (DATA_PLACEHOLDER_RE.test(u)) return;
      const url = absolutizeImageUrl(u);
      if (url) tryUrls.push(url);
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
    const uniqueUrls = [...new Set(tryUrls)];
    for (const url of uniqueUrls) {
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
    if (!blob) {
      const fallbackUrl = uniqueUrls[0];
      if (!fallbackUrl) return;
      if (pic) {
        pic.querySelectorAll('source').forEach(s => {
          rememberAttr(s, 'srcset');
          s.setAttribute('srcset', '');
        });
      }
      rememberAttr(img, 'src');
      if (img.hasAttribute('srcset')) { rememberAttr(img, 'srcset'); img.setAttribute('srcset', ''); }
      img.src = fallbackUrl;
      try { await img.decode(); } catch {}
      return;
    }
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
    if (img.complete && img.naturalWidth >= 16 && !isLikelyPlaceholderImage(img)) return;
    wrap.classList.add('a4lp-hide');
  });

  const estimateDataUrlBytes = (dataUrl) => {
    const comma = dataUrl.indexOf(',');
    const base64Len = comma >= 0 ? (dataUrl.length - comma - 1) : dataUrl.length;
    return Math.ceil(base64Len * 0.75);
  };
  const isLikelyGraphicImage = (img, src) => {
    const hint = getImageHint(img, src);
    return DECORATIVE_IMAGE_RE.test(hint) || GRAPHIC_IMAGE_RE.test(hint);
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

  // 1. 抽取内容（标题/作者/作者介绍/正文/评论）+ 站点豁免（safeKeep）
  const { titleEl, mainEl, commentEls, extraRemove, authorText: extractedAuthorText, authorBios, authorBioEls, safeKeep, rulesMatchedHost } = pickContent(SITE_RULES);
  let authorText = extractedAuthorText;

  // 而它在 5d 阶段（line ~1039）就被调用，比下方"封面页"代码块更早。
  const titleText = (titleEl?.innerText || document.title || '').trim();
  const isWSJ = rulesMatchedHost === 'wsj.com';
  if (rulesMatchedHost) {
    rememberClass(document.body, 'a4lp-site-' + rulesMatchedHost.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase());
  }
  const normalizeText = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  const leadBodyP = mainEl ? Array.from(mainEl.querySelectorAll('p')).find(p => {
    const text = normalizeText(p.innerText || p.textContent || '');
    if (authorBioEls.some(bio => bio === p || bio.contains(p))) return false;
    return text.length >= 100 && !/^(by\b|updated\b|listen\b|story by\b|more by\b|photo illustration by\b)/i.test(text);
  }) : null;
  const leadBodyTop = leadBodyP?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
  const FRONT_MATTER_TEXT = [];
    const TAIL_START_TEXT = [];

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
    if (isWSJ && /^(up next|videos|continue to article|click for sound|show conversation|write to\s|wsj\s*\|\s*buy side|reviews and recommendations|real estate insights|content provided by|alison sider writes about|ben cohen writes the|for non-personal use or to order multiple copies|copyright\s+©?\s*\d{4}\s+dow jones|©?\s*\d{4}\s+dow jones)/i.test(text)) return true;
    if (isWSJ && /^[a-f0-9]{24,}$/i.test(text)) return true;
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
  {
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
  if (extraRemove) {
    document.querySelectorAll(extraRemove).forEach(el => {
      if (isSafe(el)) return;
      el.classList.add('a4lp-hide');
    });
  }

  // 4. 广告占位文字
  {
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
  {
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
  } // /actionButton section

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
  const coverMetaItems = [];
  const forceHideNode = (target) => {
    if (!target || isSafe(target) || target.closest('.a4lp-hide')) return;
    rememberAttr(target, 'style');
    target.style.setProperty('display', 'none', 'important');
    target.classList.add('a4lp-hide');
  };const hideNYPreLeadWidgets = () => {
    const leadRect = leadBodyP.getBoundingClientRect();
    const titleBottom = titleEl?.getBoundingClientRect().bottom ?? Number.NEGATIVE_INFINITY;
    let cur = leadBodyP;
    while (cur && cur !== mainEl && cur !== document.body) {
      let sib = cur.previousElementSibling;
      while (sib) {
        const prev = sib.previousElementSibling;
        if (!isSafe(sib) && !sib.contains(leadBodyP) && !(titleEl && sib.contains(titleEl))) {
          forceHideNode(sib);
        }
        sib = prev;
      }
      cur = cur.parentElement;
    }
    const scopes = new Set([mainEl, titleEl?.closest('header, article, main, section')].filter(Boolean));
    const seen = new WeakSet();
    scopes.forEach(scope => {
      scope.querySelectorAll('*').forEach(el => {
        if (seen.has(el)) return;
        seen.add(el);
        if (isSafe(el) || el.closest('.a4lp-hide')) return;
        if (el === leadBodyP || el.contains(leadBodyP)) return;
        if (titleEl && (el === titleEl || el.contains(titleEl))) return;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        if (rect.bottom > leadRect.top + 10) return;
        if (rect.top < titleBottom - 40) return;
        if (rect.height > 96 || rect.width > 560) return;
        if (el.querySelector('p, h1, h2, h3, article, figure, picture, img')) return;
        const text = normalizeText(el.innerText || el.textContent || '');
        if (text.length > 220) return;
        const marker = [
          el.tagName,
          el.id || '',
          el.className && typeof el.className === 'string' ? el.className : '',
          el.getAttribute?.('role') || '',
          el.getAttribute?.('aria-label') || '',
          el.getAttribute?.('data-testid') || '',
          el.getAttribute?.('data-attribute-verso-pattern') || ''
        ].join(' ');
        const interactive = /button|audio|listen|play|toolbar|action|control|verso/i.test(marker) ||
          el.matches('button, a, [role="button"], svg, verso-listen-button') ||
          !!el.querySelector('button, a, [role="button"], svg, verso-listen-button') ||
          getComputedStyle(el).cursor === 'pointer';
        const listenText = /\bListen\b/i.test(text) || /\b\d+\s*(?:min(?:ute)?s?|sec(?:ond)?s?)\b/i.test(text);
        const emptyWidget = !text && rect.height >= 14 && rect.width >= 24;
        if (!interactive && !listenText && !emptyWidget) return;
        forceHideNode(bubbleHideTarget(el, 2.4, 420));
      });
    });
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
      scope.querySelectorAll('p, div, span, small, h2, h3, h4, section, header, figure, figcaption, li, time, button, a').forEach(el => {
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
  
  const LISTEN_PREFIX_RE = /^[^A-Za-z0-9]{0,6}\s*Listen\b/i;
  const LISTEN_TIME_RE = /\bListen\b[\s\S]{0,90}\b\d+\s*(?:min(?:ute)?s?|sec(?:ond)?s?)\b/i;// 5d.6 ghost 文本进阶兜底：扫 mainEl 内"短文本叶子"，找 Y 区间重叠且子序列
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
  

  // 5c. 文末卡片条清理：仅清理 mainEl 内、正文尾部之后的明显 recirc 模块，
  // 不再按”最后一个长段落之后全部隐藏”的方式截断，避免误删合法短结尾。
  if (mainEl) {
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
  {
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
        if (mainEl && node !== mainEl && mainEl.contains(node)) return;
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
  const today = new Date();
  const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const sourceHost = location.hostname.replace(/^www\./, '');
  const PUBLICATION_PREFIX_BY_HOST = {
    'wsj.com': 'WSJ'
  };
  const fallbackPublicationPrefix = sourceHost.split('.').find(Boolean) || 'web';
  const publicationPrefix = PUBLICATION_PREFIX_BY_HOST[rulesMatchedHost] || fallbackPublicationPrefix;
  const knownTitlePrefixes = [
    ...Object.values(PUBLICATION_PREFIX_BY_HOST),
    'CEIP', 'ECON', 'FA', 'NYer'
  ];
  let basePrintTitle = (titleText || document.title || 'saved-webpage').replace(/\s+-\s+(reading|archive)$/i, '').trim();
  knownTitlePrefixes.forEach(prefix => {
    basePrintTitle = basePrintTitle.replace(new RegExp('^' + escapeRegex(prefix) + '\\s*[-:：]\\s*', 'i'), '').trim();
  });
  const prefixedPrintTitle = publicationPrefix && !new RegExp('^' + escapeRegex(publicationPrefix) + '\\s*[-:：]\\s*', 'i').test(basePrintTitle)
    ? publicationPrefix + ' - ' + basePrintTitle
    : basePrintTitle;
  const printTitle = prefixedPrintTitle;
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
  const HERO_REJECT_RE = new RegExp(DECORATIVE_IMAGE_RE.source + '|' + PLACEHOLDER_IMAGE_RE.source, 'i');
  const WSJ_HERO_REJECT_RE = /\b(?:buy\s*side|reviews?\s+and\s+recommendations?|shopping|shop|product|products|deals?|coupons?|best\s+\w+\s+to\s+buy|polo\s+shirts?|real\s+estate\s+insights)\b/i;
  const HERO_GRAPHIC_RE = /\b(?:fig(?:ure)?|table|chart|graph|exhibit)\s*\.?\s*\d+\b|survey|respondents|percentage|percent|magnitude and direction|workforce impact|perspectives on ai/i;  const getMetaHeroSrc = () => {
    const selectors = [
      'meta[property="og:image:secure_url"]',
      'meta[property="og:image:url"]',
      'meta[property="og:image"]',
      'meta[name="twitter:image:src"]',
      'meta[name="twitter:image"]',
      'link[rel~="image_src" i]'
    ];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const raw = el?.getAttribute('content') || el?.getAttribute('href') || '';
      const url = absolutizeImageUrl(raw);
      if (!url) continue;
      if (HERO_REJECT_RE.test(url.toLowerCase())) continue;
      if (isWSJ && WSJ_HERO_REJECT_RE.test(url.toLowerCase())) continue;
      return url;
    }
    return '';
  };
  const getHeroHint = (img, src) => {
    const fig = img?.closest?.('figure');
    const figText = normalizeText(fig?.innerText || fig?.textContent || '').slice(0, 500);
    const caption = normalizeText(fig?.querySelector?.('figcaption, [class*="caption" i], [class*="Caption" i]')?.innerText || '').slice(0, 300);
    return [
      getImageHint(img, src),
      figText,
      caption,
      img?.getAttribute?.('data-testid') || '',
      img?.closest?.('[data-module-id]')?.getAttribute('data-module-id') || ''
    ].join(' ').toLowerCase();
  };
  const metaHeroSrc = getMetaHeroSrc();
  const heroSearchScope = (mainEl?.closest('article')) || document.querySelector('article, main') || mainEl;
  const isSupplementalImageCandidate = (img) => {
    if (!img) return false;
    if (isSupplementalNode(img)) return true;
    const wrap = img.closest('figure, picture, [role="figure"], section, aside, div');
    return !!(wrap && wrap !== mainEl && isSupplementalNode(wrap));
  };
  if (!coverHeroSrc && heroSearchScope) {
    const heroCandidates = Array.from(heroSearchScope.querySelectorAll('img')).map(img => {
      if (img.closest('.a4lp-hide')) return false;
      if (isWSJ && isSupplementalImageCandidate(img)) return false;
      if (isLikelyPlaceholderImage(img)) return false;
      const src = getBestImageUrl(img);
      if (!src || /^data:image\/gif[;,]/i.test(src)) return false;
      const hint = getHeroHint(img, src);
      if (HERO_REJECT_RE.test(hint)) return false;
      if (isWSJ && WSJ_HERO_REJECT_RE.test(hint)) return false;
      if (GRAPHIC_IMAGE_RE.test(hint) || HERO_GRAPHIC_RE.test(hint)) return false;
      const width = img.naturalWidth || parseFloat(img.getAttribute('width') || '0') || img.getBoundingClientRect().width || 0;
      const height = img.naturalHeight || parseFloat(img.getAttribute('height') || '0') || img.getBoundingClientRect().height || 0;
      if (width && height) {
        if (width < 240 || height < 120) return false;
        const aspect = width / height;
        if (aspect < 0.35 || aspect > 5.2) return false;
      }
      const rect = img.getBoundingClientRect();
      const titleRect = titleEl?.getBoundingClientRect();
      let score = 0;
      if (img.closest('figure, picture')) score += 40;
      if (mainEl && mainEl.contains(img)) score += 25;
      if (titleRect && rect.top >= titleRect.bottom - 120 && rect.top <= titleRect.bottom + 900) score += 35;
      if (rect.top >= -200 && rect.top <= window.innerHeight * 2) score += 20;
      if (rect.top > window.innerHeight * 2) score -= Math.min(60, rect.top / 900);
      score += Math.min(40, ((width || rect.width || 0) * (height || rect.height || 0)) / 50000);
      return { img, src, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    const heroCandidate = heroCandidates[0]?.img || null;
    if (heroCandidate) {
      coverHeroSrc = heroCandidates[0].src;
      coverHeroEl = heroCandidate;
    }
  }
  if (!coverHeroSrc) coverHeroSrc = metaHeroSrc;

  // 抽取 hero 图的配图说明（figcaption / 紧邻 caption-like 元素 / alt 兜底）
  // 一并搬到封面，让首页同时呈现「图 + 标注」。所有站点统一这条逻辑。
  let coverHeroCaption = '';
  if (coverHeroEl) {
    const cleanCap = (s) => (s || '').replace(/\s+/g, ' ').trim().slice(0, 280);
    const fig = coverHeroEl.closest('figure');
    if (fig) {
      const fc = fig.querySelector('figcaption');
      if (fc) coverHeroCaption = cleanCap(fc.innerText || fc.textContent);
      if (!coverHeroCaption) {
        const captionLike = fig.querySelector('[class*="caption" i], [class*="Caption" i], [class*="credit" i], [class*="Credit" i]');
        if (captionLike) coverHeroCaption = cleanCap(captionLike.innerText || captionLike.textContent);
      }
    }
    if (!coverHeroCaption) {
      // 紧邻兄弟（figure 外）：常见结构 <img>+<p class="caption">…
      const sib = coverHeroEl.parentElement?.nextElementSibling;
      if (sib && /caption|credit/i.test(sib.className || '')) {
        const t = cleanCap(sib.innerText || sib.textContent);
        if (t.length >= 4 && t.length <= 280) coverHeroCaption = t;
      }
    }
    if (!coverHeroCaption && coverHeroEl.alt) {
      const altT = cleanCap(coverHeroEl.alt);
      // alt 太短（一两词）多半是 SEO 字串，不当 caption 用
      if (altT.length >= 16) coverHeroCaption = altT;
    }
  }
  // 同时把所有 fallback/占位图全局隐藏 —— 它们不该出现在正文里污染版面
  document.querySelectorAll('img').forEach(img => {
    const src = img.currentSrc || img.src || '';
    if (!src) return;
    const hint = (src + ' ' + (img.alt || '') + ' ' + (img.className || '') + ' ' + ((img.parentElement && img.parentElement.className) || '')).toLowerCase();
    if ((HERO_REJECT_RE.test(hint) || isLikelyPlaceholderImage(img, src)) && !/(logo|icon)\s*$/i.test(img.alt || '')) {
      const wrap = img.closest('figure, picture, .a4lp-keep') || img;
      wrap.classList.add('a4lp-hide');
    }
  });

  // 7a. 封面页：顺序为 kicker → 标题 → BY 行 → 作者介绍卡 → hero 图 → SOURCE。
  // 作者介绍紧贴 BY 行下方（标题视觉单元的合适位置），让读者扫一眼标题就能
  // 看到作者背景，不必跳到尾页找 bio。所有站点统一这个位置。
  let html = '<section class="a4lp-cover a4lp-cover--' + layoutMode + '">' +
    '<div class="a4lp-cover-kicker">' +
      'SAVED WEBPAGE · ' + escapeHtml(dateStr) +
    '</div>' +
    (titleText ? '<h1 class="a4lp-cover-title">' + escapeHtml(titleText) + '</h1>' : '') +
    (authorText ? '<div class="a4lp-cover-by">BY ' + escapeHtml(authorText) + '</div>' : '');

  if (authorBios && authorBios.length) {
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

  if (coverHeroSrc) {
    html += '<div class="a4lp-cover-hero"><img src="' + escapeHtml(coverHeroSrc) + '" alt="" loading="eager" decoding="sync" fetchpriority="high">';
    if (coverHeroCaption) {
      html += '<div class="a4lp-cover-hero-caption">' + escapeHtml(coverHeroCaption) + '</div>';
    }
    html += '</div>';
  }

  // SOURCE URL：用真正的 <a href> 包裹纯文本。Chrome 保存 PDF 时自动给裸 URL
  // 文本生成的 hotspot 只覆盖第一行 line box，URL 跨行就只能点中第一行；
  // anchor 元素跨行时浏览器会为每一行 line box 都生成独立 hotspot。
  html += '<div class="a4lp-cover-source"><span>SOURCE</span>' +
    '<a class="a4lp-cover-url" href="' + escapeHtml(location.href) + '">' +
    escapeHtml(location.href) +
    '</a></div>';

  html += '</section>'; // 关闭 .a4lp-cover

  insertHost.innerHTML = html;
  document.body.insertBefore(insertHost, document.body.firstChild);

  // 7d. 隐藏正文中的原 <h1>。正文图片保留，避免封面复用首图后正文内嵌图片缺失。
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
    commentContainers: keptCommentEls.length,
    layoutMode,
    siteRulesHit: rulesMatchedHost || '(generic)',
    safeKeep: safeKeep || '(none)'
  });

  // 8. 图+caption 成组
  {
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

  // 8b. SVG 按图标/图表分流。这类问题来自浏览器打印布局阶段，
  // 必须在 window.print() 前打标。
  document.querySelectorAll('svg').forEach(svg => {
    if (svg.closest('.a4lp-source')) return;
    const marker = [
      svg.id || '',
      svg.className && typeof svg.className.baseVal === 'string' ? svg.className.baseVal : '',
      svg.getAttribute('role') || '',
      svg.getAttribute('aria-label') || '',
      svg.closest('figure, .a4lp-keep') ? 'figure' : ''
    ].join(' ').toLowerCase();
    const viewBox = svg.viewBox && svg.viewBox.baseVal;
    const attrWidth = parseFloat(svg.getAttribute('width') || '0') || 0;
    const attrHeight = parseFloat(svg.getAttribute('height') || '0') || 0;
    const hasContentGraphics = !!svg.querySelector('image, text, foreignObject');
    const largeBox = !!viewBox && (viewBox.width > 96 || viewBox.height > 96);
    const graphic = svg.closest('figure, .a4lp-keep') ||
      GRAPHIC_IMAGE_RE.test(marker) ||
      (hasContentGraphics && (largeBox || attrWidth > 120 || attrHeight > 80));
    rememberClass(svg, graphic ? 'a4lp-svg-graphic' : 'a4lp-svg-icon');
  });

  const buildReconstructedMain = (sourceEl) => {
    if (!sourceEl || sourceEl === document.body || sourceEl === document.documentElement) return null;
    const clone = sourceEl.cloneNode(true);
    const MEDIA_TAGS = new Set(['IMG', 'PICTURE', 'FIGURE', 'SVG', 'VIDEO', 'CANVAS', 'TABLE']);
    const ORPHAN_WIDGET_TEXT_RE = /^(?:Aa|\d{1,3})$/;
    const dropSelector = [
      'script', 'style', 'noscript', 'iframe', 'form',
      'input', 'button', 'select', 'textarea', 'option',
      'source', 'template', '[hidden]'
    ].join(',');
    const wsjAuthorNameTokens = isWSJ && authorText
      ? authorText.split(/\s+(?:and|&)\s+|,\s*/i).map(name => normalizeText(name).toLowerCase()).filter(Boolean)
      : [];
    const isBeforeLeadBody = (el) => {
      if (!leadBodyP || !el || el === sourceEl || el.contains(leadBodyP)) return false;
      return !!(el.compareDocumentPosition(leadBodyP) & Node.DOCUMENT_POSITION_FOLLOWING);
    };
    const isWSJLeadMatterNode = (el) => {
      if (!isWSJ || !isBeforeLeadBody(el)) return false;
      const marker = getNodeMarker(el);
      if (/(^|\b)(byline|author|timestamp|date|article-info)(\b|$)/i.test(marker)) return true;
      if (el.querySelector('img, picture, figure, svg, video, canvas, table')) return false;
      const text = normalizeText(el.innerText || el.textContent || '');
      if (!text || text.length > 240) return false;
      if (/^(by|and)$/i.test(text)) return true;
      if (/^(published|updated|last updated)\b/i.test(text)) return true;
      if (/^(jan\.?|feb\.?|mar\.?|apr\.?|may|jun\.?|jul\.?|aug\.?|sep\.?|sept\.?|oct\.?|nov\.?|dec\.?)\s+\d{1,2},\s+\d{4}/i.test(text)) return true;
      if (authorText) {
        const comparableText = text.toLowerCase().replace(/^by\s+/, '').replace(/\s+/g, ' ').trim();
        const comparableAuthor = authorText.toLowerCase().replace(/\s+/g, ' ').trim();
        if (comparableText === comparableAuthor) return true;
        if (wsjAuthorNameTokens.includes(comparableText)) return true;
      }
      return false;
    };
    const copyCleanAttrs = (from, to) => {
      const tag = to.tagName;
      const keep = [];
      if (tag === 'A') {
        const href = from.getAttribute('href');
        if (href) keep.push(['href', href]);
      } else if (tag === 'IMG') {
        const src = getBestImageUrl(from) || from.currentSrc || from.src || from.getAttribute('src') || '';
        if (src) keep.push(['src', src]);
        const alt = from.getAttribute('alt');
        if (alt) keep.push(['alt', alt]);
        keep.push(['loading', 'eager'], ['decoding', 'sync']);
      } else if (tag === 'TD' || tag === 'TH') {
        ['colspan', 'rowspan'].forEach(name => {
          const value = from.getAttribute(name);
          if (value) keep.push([name, value]);
        });
      } else if (tag === 'OL') {
        const start = from.getAttribute('start');
        if (start) keep.push(['start', start]);
      } else if (tag === 'LI') {
        const value = from.getAttribute('value');
        if (value) keep.push(['value', value]);
      }
      Array.from(to.attributes).forEach(attr => to.removeAttribute(attr.name));
      keep.forEach(([name, value]) => to.setAttribute(name, value));
    };
    const cleanPair = (from, to) => {
      if (!from || !to || to.nodeType !== 1) return;
      if (from.classList?.contains('a4lp-hide') || from.closest?.('.a4lp-hide') || isSupplementalNode(from) || isWSJLeadMatterNode(from) || to.matches(dropSelector)) {
        to.remove();
        return;
      }
      if (from.classList?.contains('a4lp-svg-icon')) {
        to.remove();
        return;
      }
      const fromChildren = Array.from(from.children);
      const toChildren = Array.from(to.children);
      toChildren.forEach((child, index) => cleanPair(fromChildren[index], child));
      if (!to.parentNode && to !== clone) return;
      if (to.closest('svg')) {
        to.removeAttribute('class');
        to.removeAttribute('style');
        return;
      }
      copyCleanAttrs(from, to);
    };
    cleanPair(sourceEl, clone);
    if (!clone.isConnected && clone.parentNode === null && sourceEl.classList?.contains('a4lp-hide')) return null;
    clone.className = 'a4lp-main a4lp-reconstructed-main';
    clone.removeAttribute('style');
    clone.querySelectorAll('div, section, span').forEach(el => {
      const text = normalizeText(el.innerText || el.textContent || '');
      const hasMedia = Array.from(el.children).some(child => MEDIA_TAGS.has(child.tagName)) ||
        !!el.querySelector('img, picture, figure, svg, video, canvas, table');
      if (!text && !hasMedia) el.remove();
    });
    clone.querySelectorAll('a, div, span').forEach(el => {
      const text = normalizeText(el.innerText || el.textContent || '');
      const hasMedia = Array.from(el.children).some(child => MEDIA_TAGS.has(child.tagName)) ||
        !!el.querySelector('img, picture, figure, svg, video, canvas, table');
      if (!hasMedia && ORPHAN_WIDGET_TEXT_RE.test(text)) el.remove();
    });
    const reconstructedText = normalizeText(clone.innerText || clone.textContent || '');
    return reconstructedText.length >= 200 ? clone : null;
  };

  const reconstructedMain = isWSJ ? buildReconstructedMain(mainEl) : null;
  if (reconstructedMain) {
    rememberClass(document.body, 'a4lp-reconstructed');
    insertHost.appendChild(reconstructedMain);
  }

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
  const printImgs = Array.from(insertHost.querySelectorAll('img'));
  await withTimeout(
    Promise.all(printImgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      if (img.decode) return img.decode().catch(() => {});
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })),
    8000
  );
  await sleep(300);
    window.addEventListener('afterprint', cleanup, { once: true });
  window.print();
  setTimeout(cleanup, PRINT_CLEANUP_FALLBACK_MS);

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
    const isPublicationName = (s) => /^(wsj|wall street journal)$/i.test(cleanAuthor(s));
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
      const siteNameRe = /^(wsj|wall street journal)$/i;
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
    if (primaryBioName) authorText = primaryBioName;
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
      rulesMatchedHost
    };
  }
}
window.__a4lpStart = (options = {}) => pdfFlow(SITE_RULES, options || {});
})();
