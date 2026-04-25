# Save Webpage to PDF — Chrome 插件

Chrome 扩展（MV3）：一键将当前网页保存为**竖向 A4 PDF**。

- 自动抽取 **标题 / 作者 / 作者介绍 / 正文 / 评论容器**，无需确认直接打印
- **封面页**：日期 + 大标题 + 作者署名 + 作者介绍卡 + 原文 URL（独占首页，`break-after: page`）
- **自动目录**：扫正文 h1/h2/h3，用 `target-counter()` 渲染章节 + 页码（Chrome 120+）
- 图片不跨页、说明（caption）与图同页、超大图等比缩到单页；自动从 `<picture>/srcset` 选最高分辨率写回 `<img>`，避免打印模糊
- 自动展开 `<details>` 与「Show more / 展开」按钮，触发懒挂载内容
- 强制浅色：覆盖站点 dark-mode；代码块 `pre-wrap`、长 URL `break-word`，避免横向截断
- 自动隐藏小漂浮 fixed、广告占位文字、收听/打印/分享类按钮
- 内置站点规则（WSJ / Foreign Affairs / New Yorker / Economist / CSIS / CNN）抽取标题/作者/作者介绍/正文/评论容器，按段落文本评分挑选正文，避免选到「最新新闻 / 相关阅读」列表
- 控制台输出抽取诊断（标题、main 容器、字数、段落数、作者数、章节数、评论容器数）便于反馈调优

## 安装

1. 打开 `chrome://extensions`
2. 右上角开启「开发者模式」
3. 点击「加载已解压的扩展程序」，选择本目录 `save-webpage/`
4. 工具栏出现蓝色图标即安装成功

## 使用

打开任意网页，点击插件图标 → 「保存为竖向 A4 PDF」：

1. 扩展滚动整页触发懒加载，等待图片加载
2. 抽取标题/作者/正文/评论，注入 `.a4lp-hide` 隐藏非正文兄弟、`.a4lp-keep` 包住「图+caption」
3. 直接调用 `window.print()`，弹出系统打印对话框
4. 目标选「另存为 PDF」→ 取消勾选「页眉和页脚」（Chrome 会记住）→ 保存

## 实现说明

- `print.css` 注入 `@page { size: A4 portrait; margin: 15mm 18mm 15mm 20mm }` 与 `break-inside: avoid` 规则；图片本体高度上限 247mm（A4 竖向可用区 267mm 减去 ~20mm 给 caption）
- `popup.js` 在调用 `window.print()` 前：
  - 滚动整页触发懒加载（最长 6s 预算），把 `loading="lazy"` 改为 eager，并等待全部 `<img>` 加载完成（单图 2s / 整体 5s 上限）
  - 用站点规则或启发式（最大 H1、按 `<p>` 文本评分扣减链接文本/链接数惩罚）抽取标题与正文；命中站点规则的容器优先于通用候选
  - author 抽取顺序：站点规则 → `meta[name=author]` 等 → schema.org `[itemprop=author]` → byline 启发式；清洗 "By/作者/文：" 前缀
  - 隐藏小尺寸 `position:fixed` 漂浮元素（< 视口面积 30%）、广告占位文字、收听/打印/分享类按钮
  - 标记不在 keep-path 上的兄弟节点为 `.a4lp-hide`
  - 在标题后插入 `BY: <作者>` + `SOURCE: <url>` 横幅
  - 扫描裸 `<img>`，若紧邻兄弟元素像说明（`figcaption` / 含 caption/figure/desc/note 类名 / 短 `<em><small><i>`），自动包进 `.a4lp-keep` 容器，让图与说明成组不跨页
  - 打印结束后清理所有 `.a4lp-hide` / `.a4lp-keep` / `.a4lp-source` 标记
- 仅请求 `activeTab` + `scripting` + `<all_urls>` 权限，无后台脚本

## 已知限制

- 跨域 iframe 内的图片不受样式控制
- 站点自带的 sticky/fixed 元素如果占据较大面积（≥ 视口 30%）不会被自动隐藏
- 「caption 检测」基于启发式（标签名、类名、长度），少数站点可能漏识别；若图片本身在 `<figure>` 中则始终生效

## 文件结构

```
save-webpage/
├── manifest.json   MV3 清单
├── popup.html      弹窗 UI（单按钮）
├── popup.js        抽取 + 确认 + 触发打印
├── print.css       @page + 防跨页规则
├── icons/          16/48/128 图标
└── README.md
```
