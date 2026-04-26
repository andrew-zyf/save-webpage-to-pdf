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

## 工作原理

**抽取 → 标记 → 打印**。`flow.js` 按 `SITE_RULES` 抽出标题 / 作者 / 正文，标记非正文节点为 `.a4lp-hide`、把图与 caption 包成 `.a4lp-keep` 不跨页，注入封面 / 目录 / 作者卡，再调 `window.print()`（Economist 走 iframe 沙箱避开 Skia 跨页 ghost paint）。详细机制与每个站的专属规则见 [docs/SITE_CUSTOMIZATION.md](docs/SITE_CUSTOMIZATION.md)。

## 文档

- [按站点定制](docs/SITE_CUSTOMIZATION.md) —— 工作原理、新增站点步骤、现存站点规则索引、全站默认行为清单
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
