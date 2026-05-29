# Changelog

## [1.1.0] — 2026-05-29

WSJ 专版：移除所有其他站点规则与特殊处理，精简至 WSJ-only。

- **WSJ 专版**：移除 Carnegie / CNN / CSIS / Economist / Foreign Affairs / New Yorker 六站的全部站点规则、内容清理逻辑与 iframe 沙箱打印路径。保留 WSJ 站点规则与通用 fallback。
- **更名**：扩展名改为 *Save WSJ Webpage to PDF*，弹窗 UI 同步更新。
- **弹窗重设计**：标题 + 图标并排、GitHub 仓库链接、去除 Chrome Web Store 引用。
- **排版优化**：段落两端对齐 + 英文连字符；块引用 accent 色左边线 + 纸色背景；表格表头背景色 + `tabular-nums`；图注居中；链接下划线细化。
- **修复正文配图丢失**：`pixel` 占位符模式收窄为 `\bpixel\b`，避免 CDN 图片 URL 中的 `pixel_ratio` 参数误触发隐藏；恢复 `DATA_PLACEHOLDER_RE` 对 `svg+xml` 的匹配。

## [1.0.1] — 2026-04-26

Cover layout polish + clickable multi-line source URL.

- **Author bio moved under the BY line**, between title block and hero image, so the byline + bio sit as one visual unit on page 1 across all sites.
- **Hero image caption** (figcaption / caption-class sibling / `alt` fallback) extracted and rendered under the cover image as italic centered text. Affects sites whose hero image has a credit / caption (CSIS, WSJ, Foreign Affairs, etc.).
- **SOURCE URL** rendered as a real `<a href>` instead of plain text so that every line of a wrapped multi-line URL is clickable in the saved PDF (Chrome's auto-detection only linked the first line).

## [1.0.0] — 2026-04-26

First Chrome Web Store release.

Built-in extraction + cleanup rules for `carnegieendowment.org`, `cnn.com`, `csis.org`, `economist.com`, `foreignaffairs.com`, `newyorker.com`, `wsj.com`. Other sites fall through to a generic paragraph-scoring extractor.

Architecture, per-site internals, and global defaults: see [docs/ARCHITECTURE](docs/ARCHITECTURE.md). Permission and data handling: see [PRIVACY](PRIVACY.md).
