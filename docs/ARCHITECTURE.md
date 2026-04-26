# 架构与定制

本文是 contributor 视角的实现参考。每一节都标注**对应文件 + 关键 symbol**（函数 / 常量 / 正则 / class 名），即使行号漂移也可以 grep 定位。

---

## 1. 模块分工

| 文件 | 角色 | 关键导出 / 入口 |
| --- | --- | --- |
| `manifest.json` | MV3 清单：权限、commands、service worker、icons | — |
| `background.js` | service worker。注册右键菜单、监听 `chrome.commands.onCommand`，调 `runFlow()` 注入脚本到当前 tab | `runFlow(tabId, options)` |
| `popup.html` / `popup.js` | 弹窗 UI：单按钮 + 快捷键提示。点击触发 `runFlow()` | `bind('pdf', handler)` |
| `flow.js` | 抽取 + 标记 + 打印一条流水线，所有调用入口共用。约 2000 行 | `window.__a4lpStart(options)` → `pdfFlow()` |
| `print.css` | 原打印路径用：`@page`、字体、防跨页、站点 scope 覆盖 | — |
| `icons/` | 16 / 48 / 128 px 工具栏图标 | — |
| `examples/` | 7 份归档样张 PDF | — |

`runFlow()` 在三处被复用：`popup.js`、`background.js` 的 `chrome.contextMenus.onClicked`、`background.js` 的 `chrome.commands.onCommand`。任何触发途径都走同一条流水线。

---

## 2. 流水线（`flow.js::pdfFlow()`）

`pdfFlow()` 内部按编号注释把 9 个阶段串起来。下面每条对应代码里的 `// 0.` `// 1.` … `// 9.` 注释块，按顺序执行。

| # | 阶段 | 主要工作 | 关键 symbol |
| --- | --- | --- | --- |
| 0  | 触发懒加载 | 滚整页 6s，每屏间隔 60ms。让 IO observer / 滚动 observer 派发 src 替换 | scroll loop in step 0 |
| 0a | 展开折叠块 | `<details>` 强制 open；点击 `aria-expanded="false"` 且文案匹配 `show more / 展开` 的 button | step 0a inline loop |
| 0b | srcset 选最高分辨率 | 按目标渲染宽 × 1.85 选 srcset 候选，跨 `<picture><source>` 一致回填 | `pickBestFromSrcset` |
| 0b'| 懒加载占位回填 | 把 `data-src / data-lazy-src / data-original / data-hi-res-src` 真实 URL 写到 `src` | `LAZY_DATA_SRC_KEYS` |
| 0e | 图片 blob inline | 所有图 `fetch` 后转 blob URL，绕开 CORS preflight 与 `<picture>` codec 选择不确定性。封顶 40 张 / 每张 4s | `inlineImage(img)` |
| 0f | 失败图隐藏 | 仅清"内容图"容器（`figure / picture / .a4lp-keep`），不动游离装饰图标 | step 0f inline forEach |
| 0c | 超大图压缩 | > 260 万像素或 > 1800px 宽的图重采样到目标列宽 × 1.8，重编码 JPEG。逻辑图（含 logo/icon/chart/diagram 关键词）走更保守阈值 | `compressHugeImage(img)` |
| 0d | 字体就绪 | `await document.fonts.ready`，1.5s 超时 | step 0d |
| 1  | 内容抽取 | 调 `pickContent()` 拿 `titleEl / mainEl / commentEls / authorText / authorBios / safeKeep` 等 | `pickContent(SITE_RULES)` |
| 1.5| 站点 flag | `isWSJ / isNY / isEconomist / isFA / isCNN / isCarnegie / isCSIS`，并在 `body` 加 `a4lp-site-<host>` class | step 1 末尾 |
| 1.5| 前/尾噪声裁剪 | `FRONT_MATTER_TEXT` / `TAIL_START_TEXT`（站点条件分支）+ `hideLeadMatches()` / `stripFromMarker()` | 同名常量 + helper |
| 2  | 隐藏小漂浮 fixed | `position: fixed` 且面积 < 30% 视口的元素打 `.a4lp-hide` | step 2 inline |
| 3  | 站点 extraRemove | 跑 `SITE_RULES[host].extraRemove` 选择器，全部打 `.a4lp-hide` | step 3 |
| 4  | 广告占位文字 | 短文本节点匹配 `AD_LABEL_RE`（"advertisement / 赞助 / 广告"等）打 `.a4lp-hide` | `AD_LABEL_RE` |
| 4b | 打印版权 / URL 回显裁剪 | "this copy is for your personal..." / WSJ reprints 等版权字段打 `.a4lp-hide`；当前页 URL 回显也清掉 | step 4b |
| 5  | 工具条按钮裁剪 | 5a 显式容器（ToolBar/ShareTools 等 class）；5b 文本 / aria-label 按 `ACTION_RE` 匹配 | `ACTION_RE` |
| 5d | 段落 ghost 修复 | 邻近段落子序列重叠 ≥ 0.75 视为半字重复，藏短的那段 | `isSubsequenceOverlap()` |
| 5d.5 | Listen 兜底扫除 | 前缀匹配 `/^Listen/i` + 时长 + 短文本；NY 走结构选择器更激进 | `sweepListen()` |
| 5d.6 | 子序列 ghost 二次扫除 | 扫 `mainEl` 内短叶子，Y 区间重叠且子序列 ≥ 0.75 隐藏更短一份 | step 5d.6 inline |
| 5c | 文末 recirc 卡 | 跑 `RECIRC_RE`（"Related/Recommended/Read Next..."）+ `looksLikeRecirculation()` 启发式 | `looksLikeRecirculation()` |
| 6  | keep-path 兜底 | 把 `mainEl / titleEl / commentEls / safeKeep` 到 `<body>` 路径上的祖先链所有兄弟打 `.a4lp-hide` | step 6 inline |
| 7  | 封面注入 | hero 图 / hero caption / 作者卡 / 目录 拼到 `.a4lp-source` 容器并 prepend 到 `<body>` | step 7a–7b |
| 7e | hero 重复隐藏 | CSIS / Carnegie：mainEl 内首图与封面 hero 视觉一致，藏掉避免页 1 + 页 2 重复 | step 7e |
| 8  | 图 + caption 成组 | 裸 `<img>` 后紧邻 caption-like 兄弟（figcaption / em / small / 含 caption-class）包成 `.a4lp-keep` | step 8 |
| 8b | SVG 图标 / 图表分流 | 按 viewBox / 容器上下文分类，加 `.a4lp-svg-icon` 或 `.a4lp-svg-graphic` | step 8b |
| 9  | 打印分发 + cleanup | Economist 走 `printViaIframe()`，其他站走 `window.print()`；`afterprint` 触发 `cleanup()` | `cleanup()`、`printViaIframe()` |

---

## 3. DOM 标记类（contract）

`flow.js` 在原页面 DOM 上贴这些 class，打印结束在 `cleanup()` 里全部撤销。任何站点专属逻辑都应该用这套标记，不要手撕 `display:none` 内联样式。

| Class | 谁加 | 作用 |
| --- | --- | --- |
| `.a4lp-hide` | step 1.5–6 各处 | 该节点不出现在打印输出。`print.css` 全局 `display: none !important`。可叠加 |
| `.a4lp-keep` | step 8 / 站点规则 | 「图 + caption」成组容器，`break-inside: avoid` |
| `.a4lp-source` | step 7（`insertHost`） | 注入封面 / 目录 / 作者卡的根容器。打印时受站点规则豁免（不进 keep-path 隐藏） |
| `.a4lp-safe` | step 1 末尾，由 `SITE_RULES[host].safeKeep` 选择器命中 | 全程豁免一切隐藏逻辑（防止 keep-path 误伤站点核心节点） |
| `.a4lp-main` | step 1 末尾，加在 `mainEl` | 标记正文容器。`print.css` 围绕这个 class 应用列宽 / 字号 |
| `.a4lp-comments` | step 1 末尾，加在 `keptCommentEls` 上 | 标记评论容器 |
| `.a4lp-comments-start` | 评论区起点分隔节点 | `break-before: page` |
| `.a4lp-comments-label` | 评论区"COMMENTS"标签 | safeKeep 默认成员 |
| `.a4lp-svg-icon` / `.a4lp-svg-graphic` | step 8b | SVG 二分类：图标 1em vs 图表满栏 |
| `.a4lp-print-root` | `pdfFlow()` 开头，加在 `<html>` / `<body>` | 让 `print.css` 全部规则的 `body.a4lp-print-root` 选择器生效 |
| `.a4lp-site-<host>` | step 1.5 | 站点 scope 入口。`print.css` 站点专属规则用 `body.a4lp-print-root.a4lp-site-<host>` 前缀 |
| `.a4lp-mode-archive` | `pdfFlow()` 开头 | 当前固定 archive 模式，预留多布局扩展 |

`cleanup()`（step 9）会移除上述所有标记 + 通过 `cleanupActions[]` 还原临时改过的 attr（`details[open]`、`<img loading>`、`src` / `srcset`、`document.title`）。

---

## 4. 抽取器（`flow.js::pickContent()`）

### 4.1 `SITE_RULES` schema

```js
'<host>': {
  main: '<正文容器选择器>',          // 必填
  title: 'h1, ...',                  // 必填，多个用逗号
  author: '<byline 选择器>',         // 选填
  authorBio: '<作者卡选择器>',       // 选填
  authorBioEls?,                     // 内部用，不要手填
  comments?: '<评论容器选择器>',     // 选填，WSJ spotim
  safeKeep?: '<完全豁免选择器>',     // 选填，避免 WSJ figure 被 keep-path 误伤
  disable?: ['toc' | 'figureGroup' | 'keepPath' | 'extraRemove' | 'fixedHide' | 'adText' | 'actionButton' | 'trailingCardStrip'],
  extraRemove?: '<额外噪声选择器>'   // 选填
}
```

### 4.2 mainEl 评分

通用 fallback 给每个候选容器算分：

```
score = sum(<p>.innerText.length) - 0.7 * sum(<a>.innerText.length) - 50 * max(0, links - paragraphs)
```

最低门槛 200。命中站点规则的优先；同优先级里分数最高者胜。这套评分专门压低链接密集区（侧栏 / 推荐流），偏向连续散文段落容器。

### 4.3 作者抽取链路

按顺序，先命中先用：

1. `SITE_RULES[host].author` 选择器 + `pickAuthorFromSelector()` 评分（靠近标题加分、单作者加分、链接密集减分、含"listen / staff writer / minute read"等噪声词减分）
2. `meta[name=author]` / `meta[property=article:author]` / `meta[name=byl]` / `meta[name=parsely-author]`
3. schema.org `[itemprop=author] [itemprop=name]` / `[itemprop=author]`
4. byline 启发式：`mainEl` 内的 `[rel=author]` / `.byline` / `[class*=byline]`

`cleanAuthor()` 清洗 `By / Story by / 作者 / 文：` 前缀，剥掉文末 "Updated" / "min read" / 发表日期。`isPublicationName()` 防止把 "WSJ" / "The New Yorker" 当作者。

### 4.4 作者 bio

`SITE_RULES[host].authorBio` 选择器 + 通用 fallback（`[class*=author-bio i]` 等）。`parseBio(el)` 拆出 `{name, role, bio}`，三字段独立提取，再去同名重复。

### 4.5 hero 图

优先级（`coverHeroSrc` / `coverHeroEl`）：

1. Carnegie 例外：先用 `og:image`（避免 hero 误命中正文里的图表）
2. 扫 `heroSearchScope`（mainEl 最近的 `<article>` 祖先，或 `document.querySelector('article, main')`）。每张候选打分：在 `<figure>` 内 +40、在 mainEl 内 +25、紧贴标题下方 +35、面积加分（封顶 +40）；命中 `HERO_REJECT_RE`（logo/icon/placeholder）或 `HERO_GRAPHIC_RE`（chart/figure 1 等）直接出局
3. 兜底：`metaHeroSrc`（og:image / twitter:image / link[rel=image_src]）

`coverHeroEl` 不为空时还会抽取 figcaption / 邻近 caption-class / `alt`（≥16 字符），渲染到封面 hero 图正下方的 `.a4lp-cover-hero-caption`。

---

## 5. 打印器

### 5.1 原路径（其他 6 站）

```
flow.js → window.print() → 浏览器加载 print.css 的 @media print 规则 → 用户保存 PDF
```

`print.css` 的关键：

- `@page { size: A4 portrait; margin: 11mm 12mm 11mm 13mm }`，首页 `18mm 14mm`
- 所有规则都套 `body.a4lp-print-root` 前缀，避免站点 dark mode 把背景印成深灰
- 站点专属覆盖用 `body.a4lp-print-root.a4lp-site-<host>` 前缀

### 5.2 iframe 沙箱（`flow.js::printViaIframe()`，仅 Economist）

```
flow.js → 建隐藏 <iframe> → 写空白 HTML →
  注入 IFRAME_CSS（自包含，~140 行，定义见 flow.js 顶部）→
  clone insertHost（封面）+ mainEl（正文）进 iframe.body →
  剥光 clone 子树非 a4lp-* 的 class / id / data-* / style →
  等 iframe.images 加载 + iframe.fonts.ready →
  iframe.contentWindow.print() →
  afterprint：移除 iframe + cleanup()
```

为什么这么做：Economist 出现 Skia 印模式 ghost paint（同一行字同时画在前页底部 + 后页顶部）。试过 `display: table` / `widows: 99` / `contain: paint` / 离屏 clone 测量 + 强制 `break-before: page`，Chrome 印模式总能绕开。最后用 iframe 完全脱离站点 CSS / 字体 / 动画 / aria-hidden 干扰，clean DOM 走 print 不再触发 ghost paint。

为什么仅 Economist：其他 6 站在 iframe 路径下出现配图问题（图片 clone 逻辑还需加固，`<picture>` codec / blob URL 跨 iframe / hero 抽取的 srcset 等）。

### 5.3 cleanup（`pdfFlow()::cleanup()`）

`afterprint` 监听一次。两件事：

1. 移除所有 `.a4lp-hide / .a4lp-keep / .a4lp-source / .a4lp-safe / .a4lp-print-root / .a4lp-site-* / .a4lp-mode-* / .a4lp-svg-*`
2. 倒序执行 `cleanupActions[]`：还原临时改过的 attr（`rememberAttr` 入栈），还原临时改过的 class（`rememberClass` 入栈）

---

## 6. 改动落点速查

| 需求 | 落点 | 作用域写法 |
| --- | --- | --- |
| 改抽取（标题 / 作者 / 正文容器 / 移除选择器） | `flow.js::SITE_RULES['<host>']` | 仅匹配该 host |
| 改前言 / 文末杂项裁剪文本 | `flow.js::FRONT_MATTER_TEXT` / `TAIL_START_TEXT` 站点条件分支 | `...(isXxx ? [/regex/] : [])` |
| 改打印样式（字号 / 间距 / 分页 / 隐藏） | `print.css` 末尾追加规则 | `body.a4lp-print-root.a4lp-site-<host>` 前缀 |
| 改 DOM 行为（移图 / 重排 / 特殊清洗） | `flow.js` 中加 `if (isXxx) { ... }` 块 | 仅在该站执行 |
| 改 iframe 沙箱样式（仅 Economist） | `flow.js::IFRAME_CSS` 字符串 | 自包含，不依赖 `print.css` |

`a4lp-site-<host>` 类名由 `flow.js` 在 `<body>` 上自动打：host 中的 `.` 替换成 `-`，转小写。例：`economist.com` → `a4lp-site-economist-com`。

---

## 7. 新增一个站点

1. **加规则**：在 `flow.js::SITE_RULES` 里按 host 字母序加一条：
   ```js
   '<host>': {
     main: '<正文容器选择器>',
     title: 'h1, ...',
     author: '<byline 选择器>',
     authorBio: '<作者卡选择器>',
     extraRemove: '<要清掉的噪声选择器>'
   }
   ```
2. **加 site flag（可选）**：`flow.js` step 1.5 区域追加 `const isXxx = rulesMatchedHost === '<host>';`，需要专属逻辑时挂 `if (isXxx) { ... }`
3. **加站点 CSS（可选）**：`print.css` 末尾追加规则，前缀 `body.a4lp-print-root.a4lp-site-<host>`
4. **加诊断**：跑一遍打印，DevTools Console 看 `[Save Webpage to PDF] extraction`：检查 `mainEl` 是否选中正确容器、`paragraphCount` 与正文段落数对得上、`author` 是否准确

---

## 8. 现存站点专属逻辑

| 站点 | 抽取 / 清洗（`flow.js`） | 打印样式（`print.css`） |
| --- | --- | --- |
| `carnegieendowment.org` | hero 走 `og:image`（step 7 hero 选择头部）；正文容器内首图隐藏（step 7e） | — |
| `cnn.com` | CDN 缩略占位识别（`isLikelyPlaceholderImage` 内 `isCNN` 分支） | — |
| `csis.org` | 正文容器内首图隐藏（step 7e） | — |
| `economist.com` | `moveEconomistPreLeadToCover()`（前言搬到封面）；段落 ghost 字符相似度去重（step 5d / 5d.6）；**iframe 沙箱打印路径**（`printViaIframe()`） | — |
| `foreignaffairs.com` | `FA_AUTHOR_BIO_RE`（作者 bio 启发式 + tail 清理） | 正文字号下调 36% |
| `newyorker.com` | `sweepListen()` / `hideNYPreLeadWidgets()`（Listen 控件结构清扫） | Listen 控件结构兜底；正文字号 12pt（≈ 16px） |
| `wsj.com` | `safeKeep` 豁免 figure；`extraRemove` 清 WhatToReadNext / MoreFromWSJ / 文末 reprints | — |

---

## 9. 全站默认行为（不要轻易改这层）

下列规则没有站点 scope，是所有站点共享的"地基"。改这些会牵连所有站，加新规则前先看这里有没有已经覆盖你要的效果。

### 9.1 排版（`print.css`）

- `@page { size: A4 portrait; margin: 11mm 12mm 11mm 13mm }`，首页 `18mm 14mm`
- 强制浅色：`color-scheme: light`，背景 `#fff`，文字 `#111`
- 衬线 fallback（Georgia / Songti / Noto Serif CJK）+ `font-synthesis: none` + `font-variant-ligatures: none`，绕开 web font 半加载导致的 ghost 字
- 撤销 `animation / transition / clip-path / mask / filter / backdrop-filter`，防止动画中间帧被 Skia 拍到
- `:root` 字号变量：`--a4lp-font-body / -h2 / -h3 / -h4 / -caption / -meta / -cover-title`，所有站共用，按站点改用变量覆盖而非直接改尺寸

### 9.2 防跨页（`print.css`）

- 图（`img / picture / figure / svg / video / canvas`）作原子块 `break-inside: avoid`
- `tr { break-inside: avoid }` —— 表格行不切，表格整体仍可跨页
- `h1..h6 { break-after: avoid }` —— 标题不落孤页底
- `figcaption / .a4lp-keep > 非媒体子` —— caption 不与图分离
- `widows: 3 / orphans: 3`

### 9.3 尺寸限制（`print.css`）

- 图横限 `185mm`、竖限 `255mm`，`object-fit: contain`
- 图标类 SVG（按钮 / 链接 / icon class / 无 width-height 属性）限到 1em；`<figure>` 内 SVG 允许放大

### 9.4 抽取与清理通用启发式（`flow.js`）

- 滚整页 6 秒触发懒加载（step 0）；展开 `<details>` 和 "Show more" 按钮（step 0a）
- `srcset` 选最高分辨率候选（`pickBestFromSrcset`）；`fetch` blob 内联图片（`inlineImage`）；超大图重编码 JPEG（`compressHugeImage`，≈ 260 万像素阈值）
- 隐藏面积 < 视口 30% 的 `position: fixed` 元素（step 2）
- 通用 byline / author-bio 选择器作为 fallback；广告占位（`adsbygoogle` / `[id*="ad-"]` 等）全站隐藏
- 收听 / 分享 / 打印 / 订阅类按钮按 `ACTION_RE`（文本 + aria-label）匹配（step 5b）
- 段落短文本子序列重叠 ≥ 0.75 视作 ghost（step 5d / 5d.6）—— 起源是 Economist 字体半加载问题，目前全站启用；其他站若误伤再收窄到 `if (isEconomist)`

---

## 10. 已知限制

- 跨域 `<img>`（CDN 且未带 `crossorigin`）会污染 canvas，超大图压缩静默跳过，PDF 体积可能偏大
- 大图重采样统一重编码为 JPEG，透明 PNG 加白底
- caption 检测基于启发式（标签 / 类名 / 长度），少数站点可能漏识别；图本身在 `<figure>` 内则始终生效。caption 过长时，图 + caption 组合仍可能超过单页高度被拆分
- 站点自带 sticky / fixed 元素若占据视口 ≥ 30% 面积不会被自动隐藏
- 跨域 iframe 内的图片不受样式控制
- iframe 沙箱路径目前只在 Economist 启用，全量推广卡在配图 clone 问题
