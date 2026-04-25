// ---- 站点规则白名单（按 host 字母序） ----
const SITE_RULES = {
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
    author: '.topper__byline a, .article-byline a, [class*="byline"] a, [class*="byline"]',
    authorBio: '[class*="author-bio"], [class*="contributor-bio"], [class*="AuthorBio"], .article__author-info',
    extraRemove: '.article-tools, .article__related, .article__most_read, .article-tags, .promo-callout, .article-actions, .related-articles, .recirculation, .related-content, .promo-block, [class*="newsletter"], [class*="paywall-promo"], [class*="audio-player"], [class*="article-callout"], [data-armstrong-id="wrapper"]'
  },
  'newyorker.com': {
    // 取整个 <article>，避免钉死内层后正文被截断（NY 正文常被切到多个
    // .body__inner-container 段）；末尾的 recirc/newsletter/footer 模块由 extraRemove 兜底。
    main: 'article, main article, [data-attribute-verso-pattern="article-body"], [class*="ArticleBodyWrapper"], [class*="BodyWrapper"], main',
    title: 'h1',
    author: '[class*="BylineWrapper"] a, [class*="byline"] a, [class*="Byline"]',
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
    author: '[itemprop="name"], [class*="byline"] a, [class*="Byline"] a, [class*="byline"]',
    authorBio: '[class*="author-bio"], [class*="AuthorBio"], [data-module-id*="author-bio"], [class*="bylineBio"]',
    comments: '[id*="spotim"], [class*="spotim"], [data-spotim-module], [id^="conversation"], [id^="sp_message"]',
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

const RESTRICTED = /^(chrome|edge|about|chrome-extension|view-source|devtools):|^https:\/\/chrome\.google\.com\/webstore|^https:\/\/chromewebstore\.google\.com/;

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
      await handler(tab);
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

bind('pdf', async (tab) => {
  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ['print.css'],
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: pdfFlow,
    args: [SITE_RULES],
  });
});

// ---- PDF flow ----
async function pdfFlow(SITE_RULES) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const withTimeout = (p, ms) => Promise.race([p, sleep(ms)]);

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

  document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });

  // 0a. 自动展开 <details> 与"点击展开"按钮（仅触发 aria-expanded=false 的 button）
  document.querySelectorAll('details:not([open])').forEach(d => { d.open = true; });
  document.querySelectorAll('button[aria-expanded="false"]').forEach(b => {
    const txt = (b.innerText || '').trim().toLowerCase();
    if (/show more|read more|expand|展开|更多|查看更多|continue reading/.test(txt)) {
      try { b.click(); } catch {}
    }
  });

  // 0b. 把 <picture>/srcset 中最高分辨率写回 <img src>，避免打印缩放后模糊
  const pickBestFromSrcset = (srcset) => {
    if (!srcset) return '';
    let best = '', bestW = 0;
    srcset.split(',').forEach(part => {
      const m = part.trim().match(/^(\S+)(?:\s+(\d+)w)?/);
      if (!m) return;
      const w = m[2] ? parseInt(m[2], 10) : 0;
      if (w >= bestW) { bestW = w; best = m[1]; }
    });
    return best;
  };
  document.querySelectorAll('img').forEach(img => {
    let best = '', bestW = 0;
    const pic = img.closest('picture');
    if (pic) {
      pic.querySelectorAll('source[srcset]').forEach(s => {
        const cand = pickBestFromSrcset(s.getAttribute('srcset'));
        const w = parseInt((s.getAttribute('srcset') || '').match(/(\d+)w/)?.[1] || '0', 10);
        if (cand && w >= bestW) { bestW = w; best = cand; }
      });
    }
    const own = pickBestFromSrcset(img.getAttribute('srcset'));
    if (own) {
      const w = parseInt((img.getAttribute('srcset') || '').match(/(\d+)w/)?.[1] || '0', 10);
      if (w >= bestW) { bestW = w; best = own; }
    }
    if (best && best !== img.src) {
      try { img.src = new URL(best, location.href).href; } catch {}
    }
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

  // 0c. 等字体就绪，避免标题/正文打印时还在用 fallback 字形
  if (document.fonts && document.fonts.ready) {
    await withTimeout(document.fonts.ready, 1500);
  }

  // 1. 抽取内容（标题/作者/作者介绍/正文/评论）+ 站点豁免（safeKeep / disable）
  const { titleEl, mainEl, commentEls, extraRemove, authorText, authorBios, safeKeep, disable, rulesMatchedHost } = pickContent(SITE_RULES);
  const off = (key) => Array.isArray(disable) && disable.includes(key);
  // safeKeep：站点规则给出的「免疫一切隐藏」选择器集合 + .a4lp-keep 容器
  const SAFE_GUARD = ['.a4lp-keep', safeKeep].filter(Boolean).join(', ');
  const isSafe = (el) => !!(el && el.closest && el.closest(SAFE_GUARD));
  // 把 safeKeep 节点先打标记，避免后续 keep-path 把它们误伤
  if (safeKeep) document.querySelectorAll(safeKeep).forEach(el => el.classList.add('a4lp-safe'));

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

  // 5c. 文末卡片列表裁剪（通用，无须站点规则）
  // 从 mainEl 末尾的直接子节点开始反向扫，遇到「没有实质段落、却堆着多条文章链接」
  // 的节点就标 hide；遇到第一个含真实正文的子节点立刻停止，避免误删中段列表。
  if (mainEl && !off('trailingCardStrip')) {
    const isRecircCard = (el) => {
      if (isSafe(el)) return false;
      if (el.classList && el.classList.contains('a4lp-hide')) return true; // 已经被前面步骤处理掉
      // 段落实质文本
      let pText = 0;
      el.querySelectorAll('p').forEach(p => {
        const t = (p.innerText || '').trim();
        if (t.length >= 30) pText += t.length;
      });
      const links = el.querySelectorAll('a[href]');
      const allText = (el.innerText || '').trim();
      // 多条链接 + 段落文本极少 → 推荐/相关/最新 列表
      if (links.length >= 2 && pText < 80 && allText.length < 1500) return true;
      // 链接文本占比过高（典型 cards）
      if (links.length >= 3) {
        let aText = 0;
        links.forEach(a => { aText += (a.innerText || '').trim().length; });
        if (allText.length > 0 && aText / allText.length > 0.55) return true;
      }
      return false;
    };
    // 从 mainEl 自身向上 2 层各做一次（覆盖「列表是 mainEl 内部尾部」与「列表是 mainEl 兄弟」两种结构）
    let scopes = [mainEl];
    if (mainEl.parentElement) scopes.push(mainEl.parentElement);
    if (mainEl.parentElement?.parentElement) scopes.push(mainEl.parentElement.parentElement);
    scopes.forEach(scope => {
      const kids = Array.from(scope.children);
      for (let i = kids.length - 1; i >= 0; i--) {
        const k = kids[i];
        if (k === mainEl) break; // 到了 mainEl 本身就停（仅作用于 mainEl 之后的尾部）
        if (commentEls.includes(k)) continue;
        if (isSafe(k)) continue;
        if (k.classList?.contains('a4lp-source')) continue; // 我们注入的封面/目录
        if (isRecircCard(k)) { k.classList.add('a4lp-hide'); continue; }
        // 遇到非 recirc 的实质内容，停止再往前删（避免误伤）
        const pText = Array.from(k.querySelectorAll('p')).reduce((s, p) => s + ((p.innerText || '').trim().length >= 30 ? (p.innerText || '').trim().length : 0), 0);
        if (pText >= 200) break;
      }
    });
    // 也处理 mainEl 内部的尾部 children
    const innerKids = Array.from(mainEl.children);
    for (let i = innerKids.length - 1; i >= 0; i--) {
      const k = innerKids[i];
      if (isSafe(k)) continue;
      if (isRecircCard(k)) { k.classList.add('a4lp-hide'); continue; }
      const pText = Array.from(k.querySelectorAll('p')).reduce((s, p) => s + ((p.innerText || '').trim().length >= 30 ? (p.innerText || '').trim().length : 0), 0);
      if (pText >= 200) break;
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
    commentEls.forEach(el => keepRoots.add(el));
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

  const insertHost = document.createElement('div');
  insertHost.className = 'a4lp-source';

  // 7a. 封面页
  let html = '<section class="a4lp-cover">' +
    '<div class="a4lp-cover-kicker">SAVED WEBPAGE · ' + escapeHtml(dateStr) + '</div>' +
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

  html += '<div class="a4lp-cover-source"><span>SOURCE</span><div class="a4lp-cover-url">' + escapeHtml(location.href) + '</div></div>';

  // 7b. 自动目录：扫 mainEl 内 h1/h2/h3，放在封面内（与封面共用一个分页）
  const headings = mainEl ? Array.from(mainEl.querySelectorAll('h1, h2, h3')).filter(h => {
    if (h === titleEl) return false;
    if (h.closest('.a4lp-hide')) return false;
    return (h.innerText || '').trim().length > 0;
  }) : [];
  if (headings.length >= 2) {
    html += '<nav class="a4lp-toc"><div class="a4lp-toc-h">目录 / Contents</div><ul>';
    let slug = 0;
    headings.forEach(h => {
      if (!h.id) h.id = 'a4lp-toc-' + (++slug);
      const lvl = Number(h.tagName[1]);
      html += '<li class="a4lp-toc-l' + lvl + '"><a href="#' + h.id + '">' + escapeHtml((h.innerText || '').trim()) + '</a></li>';
    });
    html += '</ul></nav>';
  }
  html += '</section>'; // 关闭 .a4lp-cover

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
    commentContainers: commentEls.length,
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

  await sleep(300);
  window.print();

  // 9. 清理标记
  setTimeout(() => {
    document.querySelectorAll('.a4lp-hide').forEach(el => el.classList.remove('a4lp-hide'));
    document.querySelectorAll('.a4lp-safe').forEach(el => el.classList.remove('a4lp-safe'));
    document.querySelectorAll('.a4lp-keep').forEach(wrap => {
      const parent = wrap.parentNode;
      while (wrap.firstChild) parent.insertBefore(wrap.firstChild, wrap);
      parent.removeChild(wrap);
    });
    document.querySelectorAll('.a4lp-source').forEach(el => el.remove());
  }, 500);

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
    const tryAdd = (el, fromRule) => {
      if (!el || !el.isConnected || seen.has(el)) return;
      seen.add(el);
      const text = (el.innerText || '').trim().length;
      if (text < 200) return;
      const s = score(el);
      if (s < 200) return;
      mainCandidates.push({ el, score: s, fromRule: !!fromRule });
    };
    if (rules?.main) {
      rules.main.split(',').map(s => s.trim()).forEach(sel => {
        document.querySelectorAll(sel).forEach(el => tryAdd(el, true));
      });
    }
    ['article', 'main', '[role="main"]', '#content', '#main', '.post', '.article', '.entry-content']
      .forEach(sel => document.querySelectorAll(sel).forEach(el => tryAdd(el, false)));
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
    let authorText = '';
    const cleanAuthor = (s) => (s || '')
      .replace(/\s+/g, ' ')
      .replace(/^\s*(by|作者|文\/|文：|撰文|文)\s*[:：]?\s*/i, '')
      .trim()
      .slice(0, 200);
    if (rules?.author) {
      const nodes = document.querySelectorAll(rules.author);
      const names = new Set();
      nodes.forEach(n => { const t = cleanAuthor(n.innerText || n.textContent); if (t && t.length < 80) names.add(t); });
      authorText = [...names].join(', ');
    }
    if (!authorText) {
      const meta = document.querySelector('meta[name="author"], meta[property="article:author"], meta[name="byl"], meta[name="parsely-author"]');
      if (meta) authorText = cleanAuthor(meta.getAttribute('content'));
    }
    if (!authorText) {
      const sch = document.querySelector('[itemprop="author"] [itemprop="name"], [itemprop="author"]');
      if (sch) authorText = cleanAuthor(sch.innerText || sch.textContent);
    }
    if (!authorText) {
      const scope = mainEl || document.body;
      const cand = scope.querySelector('[rel="author"], .author, .byline, [class*="byline" i], [class*="Byline"], [class*="author-name" i]');
      if (cand) authorText = cleanAuthor(cand.innerText || cand.textContent);
    }

    // authorBios 抽取：站点规则的 authorBio 选择器 + 通用 fallback
    // 每个 bio 解析出 {name, role, bio}，去重后返回。
    const bioSelector = [
      rules?.authorBio || '',
      '[class*="author-bio" i]', '[class*="contributor-bio" i]', '[class*="contributor-info" i]',
      '[class*="AuthorBio"]', '[class*="ContributorBio"]',
      '[itemprop="author"]'
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
      const nameEl = el.querySelector('a[href*="/people/"], a[href*="/author"], a[href*="/expert"], h2 a, h3 a, h2, h3, .name, [class*="name" i] a, [class*="name" i], strong');
      const name = cleanAuthor(nameEl?.innerText || nameEl?.textContent || '');
      const roleEl = el.querySelector('.title, .position, .role, [class*="title" i]:not(h1):not(h2):not(h3), [class*="position" i], [class*="role" i], em, small');
      let role = (roleEl?.innerText || roleEl?.textContent || '').replace(/\s+/g, ' ').trim();
      if (role && name && role.toLowerCase().includes(name.toLowerCase())) role = '';
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

    return {
      titleEl, mainEl, commentEls,
      extraRemove: rules?.extraRemove || '',
      authorText, authorBios: dedupBios,
      safeKeep: rules?.safeKeep || '',
      disable: Array.isArray(rules?.disable) ? rules.disable : [],
      rulesMatchedHost
    };
  }
}

