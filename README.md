# Save WSJ Webpage to PDF

> Chrome 扩展（MV3）。一键把 WSJ 文章页重构为竖向 A4 PDF：自动抽取标题 / 作者 / 正文，生成带封面的干净归档版本。打印前会清理网页控件、推荐流与站点样式干扰，并针对长文阅读做排版优化。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-no_data_collected-success)](PRIVACY.md)
[![Changelog](https://img.shields.io/badge/Changelog-v1.1.1-blue)](CHANGELOG.md)

专为 **WSJ** 优化；其他站点走通用 fallback 路径。

## 安装

1. **获取仓库**——任选其一：
   - `git clone https://github.com/andrew-zyf/save-wsj-webpage-to-pdf.git`
   - 或在 GitHub 页面点 `Code → Download ZIP`，解压到本地任意目录
2. **加载到 Chrome**：打开 `chrome://extensions`，右上角开「开发者模式」，点「加载已解压的扩展程序」，选刚才克隆/解压出来的仓库根目录
3. 工具栏出现蓝色图标即装好

> `examples/` 仅是样张 PDF，不参与扩展运行；嫌占空间可以直接删除该文件夹。

## 使用

任选其一触发：

- 工具栏图标 → 「保存当前页面」
- 页面右键 → `Save WSJ Webpage to PDF`
- 快捷键 `Shift + Option + P`（macOS）/ `Shift + Alt + P`（Win/Linux），可在 `chrome://extensions/shortcuts` 改键

## 样张

[`examples/`](examples/) 里每行左侧是本扩展生成的 PDF，右侧 ↗ 是原文，可对照效果。

| 站点 | 样张 PDF | 原文 |
| --- | --- | --- |
| WSJ | [The Secretive Billionaire](examples/WSJ%20-%20The%20Secretive%20Billionaire%20Who%E2%80%99s%20Conquering%20the%20World%E2%80%99s%20Richest%20Sports%20Leagues.pdf) | [↗](https://www.wsj.com/sports/soccer/stan-kroenke-arsenal-rams-champions-league-b00db776) |

## 工作原理

**抽取 → 重构 → 打印**：`flow.js` 先从 WSJ 页面抽出标题 / 作者 / 正文与图片，再生成受控的打印 DOM，只打印封面和净化后的正文，避免原站工具条、推荐模块和复杂 CSS 污染 PDF。详见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 文件结构

```text
save-wsj-webpage-to-pdf/
├── manifest.json                MV3 清单（权限 + 命令 + service worker）
├── popup.html                   弹窗 UI（单按钮）
├── popup.js                     popup 触发：注入 print.css + flow.js
├── background.js                service worker：右键菜单 + 快捷键 → flow.js
├── flow.js                      抽取 + 重构 + 打印；含 WSJ 站点规则
├── print.css                    @page + 防跨页 + 排版覆盖
├── icons/                       icon16/48/128.png
├── examples/                    WSJ 样张 PDF
├── tests/                       Node / Playwright 回归测试
├── docs/
│   └── ARCHITECTURE.md          工作原理 + 已知限制
├── CHANGELOG.md
├── PRIVACY.md
├── LICENSE
└── README.md
```

## License

MIT，见 [LICENSE](LICENSE)。
