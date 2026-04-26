# 按站点定制

## 工作原理

**抽取 → 标记 → 打印**。

**抽取**（`flow.js`）走 `SITE_RULES`：每个站给一组 CSS 选择器（`main` / `title` / `author` / `authorBio` / `extraRemove`）。命中规则的元素直接采用；通用 fallback 按 `<p>` 文本评分（扣减链接文本 / 链接数惩罚）挑出正文容器，避开侧栏和推荐流。作者抽取链路：站点规则 → `meta[name=author]` → schema.org `[itemprop=author]` → byline 启发式。

**标记**：先滚整页 6 秒触发懒加载、展开 `<details>` 与 "Show more"、`fetch` blob inline 图片绕过 CORS 偶发问题。然后给非正文兄弟节点打 `.a4lp-hide`、给「裸 `<img>` + 紧邻 caption」包成 `.a4lp-keep` 不跨页、给小漂浮 / 广告 / 收听-分享-订阅按钮也打 `.a4lp-hide`。把封面（标题 + 作者卡 + SOURCE URL + 自动目录）作为 `.a4lp-source` 容器插到 body 最前。

**打印**两条路径：

- **iframe 沙箱**（仅 Economist）：clone 封面 + 正文到独立 iframe，注入自包含 `IFRAME_CSS`，调 `iframe.contentWindow.print()`。iframe 完全脱离站点 CSS / 字体 / 动画 / aria-hidden 干扰，从根上消除 Economist 的跨页文字撕裂和 ghost paint。其他站在 iframe 下出现配图问题，全量推广待图片 clone 逻辑加固
- **原路径**（其他 6 站）：直接 `window.print()`，靠 `print.css` 的 `@page` + 字号 + 防跨页规则约束 layout

`afterprint` 清理：移除所有 `.a4lp-hide` / `.a4lp-keep` / `.a4lp-source`，恢复临时改过的 `details` / `loading` / `src` / `srcset`、`document.title`（用作 PDF 默认文件名 `媒体简称 - 标题`）。

排版：列宽 158mm、封面列宽 166mm、图本体高度上限 255mm，> 260 万像素图重编码 JPEG。Georgia / Songti / Noto Serif CJK 衬线 fallback，强制浅色覆盖站点 dark mode。`@page { size: A4 portrait; margin: 11mm 12mm 11mm 13mm }`，首页 `18mm 14mm`。目录用 CSS `target-counter()`，长目录自动独立分页。

## 核心原则

所有新规则都站点定向，不动通用层。同一条 hack 在 A 站救命、在 B 站可能砸场。把作用域钉死，回归才不会跨站串味。

## 改动落点速查

| 需求 | 落点 | 作用域写法 |
| --- | --- | --- |
| 改抽取（标题 / 作者 / 正文容器 / 移除选择器） | `flow.js` 顶部 `SITE_RULES['<host>']` | 仅匹配该 host |
| 改前言 / 文末杂项裁剪文本 | `flow.js` 中 `FRONT_MATTER_TEXT` / `TAIL_START_TEXT` 站点条件分支 | `...(isXxx ? [/regex/] : [])` |
| 改打印样式（字号 / 间距 / 分页 / 隐藏） | `print.css` 末尾追加规则 | `body.a4lp-print-root.a4lp-site-<host>` 前缀 |
| 改 DOM 行为（移图 / 重排 / 特殊清洗） | `flow.js` 中加 `if (isXxx) { ... }` 块 | 仅在该站执行 |

`a4lp-site-<host>` 类名由 `flow.js` 在 `body` 上自动打：host 中的 `.` 替换成 `-`，转小写。例：`economist.com` → `a4lp-site-economist-com`。

## 新增一个站点

1. 在 `flow.js` 顶部 `SITE_RULES` 里加一条（按 host 字母序）：
   ```js
   '<host>': {
     main: '<正文容器选择器>',
     title: 'h1, ...',
     author: '<byline 选择器>',
     authorBio: '<作者卡选择器>',
     extraRemove: '<要清掉的噪声选择器>'
   }
   ```
2. 需要专属逻辑时，在 `flow.js` 站点 flag 列表追加 `const isXxx = rulesMatchedHost === '<host>';`，挂在 `if (isXxx) { ... }` 下。
3. 需要专属打印样式时，在 `print.css` 末尾加规则，前缀 `body.a4lp-print-root.a4lp-site-<host>`。

## 现存站点专属逻辑

| 站点 | 抽取 / 清洗（`flow.js`） | 打印样式（`print.css`） |
| --- | --- | --- |
| `carnegieendowment.org` | hero 走 `og:image`；正文容器内首图隐藏避免 hero 重复 | — |
| `cnn.com` | CDN 缩略占位识别 | — |
| `csis.org` | 正文容器内首图隐藏避免 hero 重复 | — |
| `economist.com` | 前言搬到封面；段落 ghost 字符相似度去重；**iframe 沙箱打印路径**（`printViaIframe`） | — |
| `foreignaffairs.com` | 作者 bio 启发式 | 正文字号下调 36% |
| `newyorker.com` | Listen 控件结构清扫；前置 widget 隐藏 | Listen 控件结构兜底；正文字号 12pt（≈ 16px） |
| `wsj.com` | author-bio 容器额外隐藏；reprints 文末清理 | — |

## 全站默认行为（不要轻易改这层）

下列规则没有站点 scope，是所有站点共享的"地基"。改这些会牵连所有站，加新规则前先看这里有没有已经覆盖你要的效果。

### 排版（`print.css`）

- `@page { size: A4 portrait; margin: 11mm 12mm 11mm 13mm }`，首页 `18mm 14mm`
- 强制浅色：`color-scheme: light`，背景 `#fff`，文字 `#111`
- 衬线 fallback（Georgia / Songti / Noto Serif CJK）+ `font-synthesis: none` + `font-variant-ligatures: none`，绕开 web font 半加载导致的 ghost 字
- 撤销 `animation / transition / clip-path / mask / filter / backdrop-filter`，防止动画中间帧被 Skia 拍到
- `:root` 字号变量：`--a4lp-font-body / -h2 / -h3 / -h4 / -caption / -meta / -cover-title`，所有站共用，按站点改用变量覆盖而非直接改尺寸

### 防跨页（`print.css`）

- 图（`img / picture / figure / svg / video / canvas`）作原子块 `break-inside: avoid`
- `tr { break-inside: avoid }` —— 表格行不切，表格整体仍可跨页
- `h1..h6 { break-after: avoid }` —— 标题不落孤页底
- `figcaption / .a4lp-keep > 非媒体子` —— caption 不与图分离
- `widows: 3 / orphans: 3`

### 尺寸限制（`print.css`）

- 图横限 `185mm`、竖限 `255mm`，`object-fit: contain`
- 图标类 SVG（按钮 / 链接 / icon class / 无 width-height 属性）限到 1em；`<figure>` 内 SVG 允许放大

### 抽取与清理通用启发式（`flow.js`）

- 滚整页 6 秒触发懒加载；展开 `<details>` 和 "Show more" 按钮
- `srcset` 选最高分辨率候选；`fetch` blob 内联图片；超大图重编码为 JPEG（≈ 260 万像素阈值）
- 隐藏面积 < 视口 30% 的 `position: fixed` 元素
- 通用 byline / author-bio 选择器作为 fallback；广告占位（`adsbygoogle` / `[id*="ad-"]` 等）全站隐藏
- 收听 / 分享 / 打印 / 订阅类按钮按 `ACTION_RE`（文本 + aria-label）匹配
- "段落短文本子序列重叠 ≥ 0.75 视作 ghost" —— 起源是 Economist 字体半加载问题，目前全站启用；其他站若误伤再收窄
