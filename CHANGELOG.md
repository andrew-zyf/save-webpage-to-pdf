# Changelog

## [1.1.1] — 2026-05-29

WSJ 打印重构：不再直接打印原网页 DOM，而是先生成干净的文章版面。

- **重构打印路径**：WSJ 页面会抽取标题 / 作者 / 正文 / 图片后生成 `.a4lp-reconstructed-main`，打印时只输出封面和净化正文，避免原站布局、样式和浮层污染 PDF。
- **清理推荐流与控件碎片**：过滤 `Up Next`、`Videos`、`Buy Side`、`Real Estate`、`Continue To Article` 等文末模块，并移除 `Aa`、评论数字、按钮、表单、iframe、脚本和站点 `class/style`。
- **修复正文图片丢失**：`safeKeep` 保留 WSJ 正文图片时不再反向隐藏同级正文段落；打印前等待重构正文图片解码完成；打印后不再立即 cleanup，避免 Chrome 打印预览尚未渲染完后续页时撤销图片资源。
- **修复 WSJ 封面图误选**：封面 hero 优先使用正文 lead photo，并排除购物、推荐、Buy Side、Real Estate 等模块中的图片，避免商品图抢占封面。
- **清理正文噪声**：重构正文不再重复输出 WSJ Byline / 作者链接，并移除 Dow Jones copyright boilerplate 与尾部 hash。
- **优化重构正文图片排版**：正文图片限制在阅读栏内完整缩放，caption / credit 紧贴图片；封面 hero 被包装后仍按封面规则显示。
- **样张更新**：README 样张改为 Stan Kroenke / Arsenal / Rams 文章，匹配当前 WSJ 打印效果。
- **修复 data SVG 配图**：不再把有实际尺寸的 `data:image/svg+xml` 内容图误判为占位图；仍过滤 tiny GIF / 1px tracker 类占位图。

## [1.1.0] — 2026-05-29

WSJ 专版：移除所有其他站点规则与特殊处理，精简至 WSJ-only。

- **WSJ 专版**：移除 Carnegie / CNN / CSIS / Economist / Foreign Affairs / New Yorker 六站的全部站点规则、内容清理逻辑与 iframe 沙箱打印路径。保留 WSJ 站点规则与通用 fallback。
- **更名**：扩展名改为 *Save WSJ Webpage to PDF*，弹窗 UI 同步更新。
- **弹窗重设计**：标题 + 图标并排、GitHub 仓库链接、去除 Chrome Web Store 引用。
- **排版优化**：段落两端对齐 + 英文连字符；块引用 accent 色左边线 + 纸色背景；表格表头背景色 + `tabular-nums`；图注居中；链接下划线细化。
- **修复正文配图丢失**：`pixel` 占位符模式收窄为 `\bpixel\b`，避免 CDN 图片 URL 中的 `pixel_ratio` 参数误触发隐藏；恢复 `DATA_PLACEHOLDER_RE` 对 `svg+xml` 的匹配。
