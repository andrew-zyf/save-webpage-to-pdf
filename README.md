# Save Webpage to PDF

> Chrome 扩展（MV3）。一键把当前文章页保存为竖向 A4 PDF：自动抽取标题 / 作者 / 正文，生成带封面、目录、作者卡的归档版本。针对长文阅读做了排版优化——衬线字体、合理列宽、图片不跨页、超大图自动下采样。

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-preview-1a73e8?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/fcilaglhmmpjaifkhedeihdbhaooohfe/preview?hl=zh-CN&authuser=0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-no_data_collected-success)](PRIVACY.md)
[![Changelog](https://img.shields.io/badge/Changelog-v1.0.0-blue)](CHANGELOG.md)

内置规则覆盖 **Carnegie · CNN · CSIS · The Economist · Foreign Affairs · The New Yorker · WSJ**；其他站点走通用 fallback 路径，多数文章页也能识别。

## 安装

**方式一（推荐）**：[Chrome Web Store →「添加到 Chrome」](https://chromewebstore.google.com/detail/fcilaglhmmpjaifkhedeihdbhaooohfe/preview?hl=zh-CN&authuser=0)。

**方式二（开发者模式）**：

1. 打开 `chrome://extensions`，右上角开「开发者模式」
2. 「加载已解压的扩展程序」→ 选本目录
3. 工具栏出现蓝色图标即装好

## 使用

任选其一触发：

- 工具栏图标 → 「保存为竖向 A4 PDF」
- 页面右键 → `Save Webpage to PDF`
- 快捷键 `Shift + Option + P`（macOS）/ `Shift + Alt + P`（Win/Linux），可在 `chrome://extensions/shortcuts` 改键

打印对话框弹出后选「另存为 PDF」。第一次记得 **取消勾选「页眉和页脚」**——Chrome 会记住，下次默认保留。

## Examples

[`examples/`](examples/) 里每行左侧是本扩展生成的 PDF，右侧 ↗ 是原文，可对照效果。

| 站点 | PDF | 原文 |
| --- | --- | --- |
| Carnegie | [The AI Labor Debate](examples/Carnegie%20-%20The%20AI%20Labor%20Debate_%20Three%20Views%20on%20the%20Future%20of%20Work%20_%20Carnegie%20Endowment%20for%20International%20Peace.pdf) | [↗](https://carnegieendowment.org/research/2026/04/the-ai-labor-debate-three-views-on-the-future-of-work) |
| CNN | [Mali insurgents hit military bases](examples/CNN%20-%20Mali%20insurgents%20hit%20military%20bases%20in%20%E2%80%98complex%20attacks%E2%80%99%20claimed%20by%20al%20Qaeda-linked%20militants.pdf) | [↗](https://edition.cnn.com/2026/04/25/africa/mali-bamako-gunmen-attacks-intl) |
| CSIS | [How to Interpret Wartime Oil Prices](examples/CSIS%20-%20How%20to%20Interpret%20Wartime%20Oil%20Prices.pdf) | [↗](https://www.csis.org/analysis/how-interpret-wartime-oil-prices) |
| Foreign Affairs | [The Tech High Ground](examples/Foreign%20Affairs%20-%20The%20Tech%20High%20Ground.pdf) | [↗](https://www.foreignaffairs.com/united-states/tech-high-ground-jake-sullivan) |
| New Yorker | [J. D. Vance's Bumpy Ride](examples/New%20Yorker%20-%20J.%20D.%20Vance%E2%80%99s%20Bumpy%20Ride.pdf) | [↗](https://www.newyorker.com/magazine/2026/04/27/j-d-vances-bumpy-ride) |
| The Economist | [The rhetoric of war has changed](examples/The%20Economist%20-%20The%20rhetoric%20of%20war%20has%20changed.%20Not%20for%20the%20better.pdf) | [↗](https://www.economist.com/culture/2026/04/23/the-rhetoric-of-war-has-changed-not-for-the-better) |
| WSJ | [United's Card-Counting CEO](examples/WSJ%20-%20United%E2%80%99s%20Card-Counting%20CEO%20Made%20a%20Huge%20Bet%E2%80%94and%20It%E2%80%99s%20Paying%20Off.pdf) | [↗](https://www.wsj.com/business/airlines/united-airlines-ceo-scott-kirby-delta-american-11621d97) |

## 架构

整体三步：**抽取 → 标记 → 打印**。

**抽取**（`flow.js`）走 `SITE_RULES`：每个站给一组 CSS 选择器（`main` / `title` / `author` / `authorBio` / `extraRemove`）。命中规则的元素直接采用；通用 fallback 按 `<p>` 文本评分（扣减链接文本/链接数惩罚）挑出正文容器，避开侧栏和推荐流。作者抽取链路：站点规则 → `meta[name=author]` → schema.org `[itemprop=author]` → byline 启发式，并清洗 `By/Story by/作者:` 等前缀。

**标记**：先滚整页 6 秒触发懒加载、展开 `<details>` 和「Show more」按钮，等图片加载并 inline 成 blob URL（绕过跨域 CORS 偶发问题）。然后给非正文兄弟节点打 `.a4lp-hide`、给「裸 `<img>` + 紧邻 caption」包上 `.a4lp-keep` 让它们成组不跨页、给小尺寸 `position: fixed` 漂浮元素 / 广告占位 / 收听-分享-订阅按钮也打 `.a4lp-hide`。把抽好的封面（标题 + 作者卡 + SOURCE URL + 自动生成的目录）作为 `.a4lp-source` 容器插到 body 最前。

**打印**：分两条路径——

- **iframe 沙箱**（仅 The Economist 启用）：clone 封面 + 正文到独立 iframe，注入自包含的 `IFRAME_CSS`，调 `iframe.contentWindow.print()`。iframe 文档完全脱离站点 CSS / 字体 / 动画 / aria-hidden 干扰，从根上消除了 Economist 的跨页文字撕裂和 ghost paint。**全量推广受阻**：其他站在 iframe 路径下出现配图问题，待图片 clone 逻辑加固后再推广
- **原路径**（其他 6 个站）：直接 `window.print()`，靠 `print.css` 的 `@page` + 字号 + 防跨页规则约束 layout

打印结束在 `afterprint` 里清理：移除所有 `.a4lp-hide` / `.a4lp-keep` / `.a4lp-source` 标记，恢复临时改过的 `details` / `loading` / `src` / `srcset`，临时改的 `document.title`（用作 PDF 默认文件名 `媒体简称 - 标题`）也还原。

排版细节：列宽 `158mm`、封面列宽 `166mm`、图片本体高度上限 `255mm`，超过 260 万像素的图自动重编码为 JPEG。统一衬线字体（Georgia / Songti / Noto Serif CJK），强制浅色覆盖站点 dark mode。`@page { size: A4 portrait; margin: 11mm 12mm 11mm 13mm }`，首页留 `18mm 14mm` 给封面呼吸感。目录用 CSS `target-counter()` 自动渲染章节 + 页码（Chrome 120+），长目录自动独立分页。

## 扩展开发

- [按站点定制指引](docs/SITE_CUSTOMIZATION.md) —— 改抽取规则 / 打印样式 / 站点 DOM 行为的落点速查、新增站点最小步骤、现存站点规则索引、全站默认行为清单（"地基层"，改之前先看这）
- [CHANGELOG](CHANGELOG.md) —— 版本记录
- [PRIVACY](PRIVACY.md) —— 隐私政策（无数据收集）

## 已知限制

- 跨域 `<img>`（CDN 且未带 `crossorigin`）会污染 canvas，超大图压缩静默跳过，PDF 体积可能偏大
- 大图重采样统一重编码为 JPEG，透明 PNG 加白底
- caption 检测基于启发式（标签 / 类名 / 长度），少数站点可能漏识别；图本身在 `<figure>` 内则始终生效。caption 过长时，图 + caption 组合仍可能超过单页高度被拆分
- 站点自带 sticky / fixed 元素若占据视口 ≥ 30% 面积不会被自动隐藏
- 跨域 iframe 内的图片不受样式控制
- iframe 沙箱路径目前只在 Economist 启用，全量推广卡在配图问题

## 文件结构

```text
save-webpage-to-pdf/
├── manifest.json           MV3 清单
├── popup.html              弹窗 UI
├── popup.js                Popup 触发逻辑
├── background.js           service worker：右键菜单 + 快捷键
├── flow.js                 站点规则 + 抽取 + 标记 + 打印（共用入口）
├── print.css               @page + 防跨页规则（原路径）
├── icons/                  16 / 48 / 128 图标
├── examples/               样张 PDF
├── docs/
│   └── SITE_CUSTOMIZATION.md
├── CHANGELOG.md
├── PRIVACY.md
├── LICENSE                 MIT
└── README.md
```

## License

MIT，见 [LICENSE](LICENSE)。
