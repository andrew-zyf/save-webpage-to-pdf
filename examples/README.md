# Examples

这批样张生成于 `2026-04-26`，用于对比 `阅读版` 与 `归档版` 两种输出，并持续回归站点规则。

每个样张目录都包含：

- `reading.pdf`：阅读版
- `archive.pdf`：归档版

## 对比总览

| 目录 | 站点 | 原文 URL | 阅读版 | 归档版 | 当前结论 |
| --- | --- | --- | --- | --- | --- |
| [`wsj-united-card-counting`](wsj-united-card-counting/) | `WSJ` | [wsj.com](https://www.wsj.com/business/airlines/united-airlines-ceo-scott-kirby-delta-american-11621d97) | [10 页 / 8.7 MB](wsj-united-card-counting/reading.pdf) | [11 页 / 8.7 MB](wsj-united-card-counting/archive.pdf) | 头尾清理稳定；主要剩余问题是图片导致体积偏大 |
| [`newyorker-jd-vance`](newyorker-jd-vance/) | `New Yorker` | [newyorker.com](https://www.newyorker.com/magazine/2026/04/27/j-d-vances-bumpy-ride) | [4 页 / 124 KB](newyorker-jd-vance/reading.pdf) | [5 页 / 176 KB](newyorker-jd-vance/archive.pdf) | 作者抽取已修正为单作者；首页 `Listen` 已清掉 |
| [`economist-rhetoric-of-war`](economist-rhetoric-of-war/) | `Economist` | [economist.com](https://www.economist.com/culture/2026/04/23/the-rhetoric-of-war-has-changed-not-for-the-better) | [5 页 / 212 KB](economist-rhetoric-of-war/reading.pdf) | [5 页 / 212 KB](economist-rhetoric-of-war/archive.pdf) | `Explore more` / edition / recirc 尾页已清掉；首页元信息明显收敛 |
| [`foreignaffairs-china-russia-iran`](foreignaffairs-china-russia-iran/) | `Foreign Affairs` | [foreignaffairs.com](https://www.foreignaffairs.com/united-states/how-china-and-russia-can-exploit-iran-war) | [9 页 / 2.0 MB](foreignaffairs-china-russia-iran/reading.pdf) | [9 页 / 2.0 MB](foreignaffairs-china-russia-iran/archive.pdf) | 体积和页数明显下降；正文前作者简介与 `More by` 仍需继续清理 |
| [`cnn-mali-insurgents`](cnn-mali-insurgents/) | `CNN` | [edition.cnn.com](https://edition.cnn.com/2026/04/25/africa/mali-bamako-gunmen-attacks-intl) | [5 页 / 128 KB](cnn-mali-insurgents/reading.pdf) | [6 页 / 132 KB](cnn-mali-insurgents/archive.pdf) | 作者已标准化为 `Reuters`；正文前 `UPDATED` 与 `Story by Reuters` 仍重复 |
| [`carnegie-ai-labor-debate`](carnegie-ai-labor-debate/) | `Carnegie` | [carnegieendowment.org](https://carnegieendowment.org/research/2026/04/the-ai-labor-debate-three-views-on-the-future-of-work) | [27 页 / 2.5 MB](carnegie-ai-labor-debate/reading.pdf) | [33 页 / 2.7 MB](carnegie-ai-labor-debate/archive.pdf) | 阅读版已裁掉尾部附录与免责声明；归档版保留注释更完整 |
| [`csis-wartime-oil-prices`](csis-wartime-oil-prices/) | `CSIS` | [csis.org](https://www.csis.org/analysis/how-interpret-wartime-oil-prices) | [6 页 / 536 KB](csis-wartime-oil-prices/reading.pdf) | [6 页 / 532 KB](csis-wartime-oil-prices/archive.pdf) | 当前问题最多：作者行污染、目录误抓 `Related Content`、文末免责声明与推荐流残留 |

## 逐项说明

### `wsj-united-card-counting`

- 文件：[reading.pdf](wsj-united-card-counting/reading.pdf)、[archive.pdf](wsj-united-card-counting/archive.pdf)
- 表现：封面不重复，目录未混入推荐流，作者简介 / Buy Side / 文末推荐已清掉
- 差异：归档版仅比阅读版多 `1` 页，主要来自完整来源 URL 和归档抬头

### `newyorker-jd-vance`

- 文件：[reading.pdf](newyorker-jd-vance/reading.pdf)、[archive.pdf](newyorker-jd-vance/archive.pdf)
- 表现：多作者串、`Comment`、图片署名已经清理
- 差异：归档版额外保留作者卡；阅读版更紧凑
- 已修待回归：文本启发式（FRONT_MATTER_TEXT / isSupplementalNode）扫不到 NY 的 Listen 控件（控件可能在自定义元素或 `mainEl` 之外）。改用结构选择器，在 SITE_RULES.newyorker.com 的 `extraRemove` 增加 `[class*="ListenButton" i] / [aria-label*="Listen to" i] / button[aria-label*="Listen" i]` 等

### `economist-rhetoric-of-war`

- 文件：[reading.pdf](economist-rhetoric-of-war/reading.pdf)、[archive.pdf](economist-rhetoric-of-war/archive.pdf)
- 表现：推荐流、edition CTA、`More from Culture` 已被裁掉
- 差异：归档版保留完整 URL，阅读版更短
- 已修待回归：
  - 正文出现 `and ou marshal not merel ords` 之类夹半字噪声 —— 真因是 Skia print 在段落跨页边界处的"半字重影"渲染 bug：同一行先在 N 页底被裁掉下行字符渲染一次，又在 N+1 页顶完整重渲染。print.css 给 `.a4lp-main p` 加 `break-inside: avoid` 让段落整段跨页绕开此问题（dedup 启发式与 aria-hidden 隐藏作为兜底保留）
  - 插图灰底 / 整体丢失 —— 三条原因叠加：(1) 上一版的 aria-hidden 隐藏规则把外层带 aria-hidden 的 lightbox 容器误伤，现在用 `:not(:has(img))` 等排除；(2) 站点 `<picture><source>` 走 AVIF/WebP 且需 CORS，popup.js 现在做两轮等待：第一轮 9s 全图 / 3.5s 单图，仍未加载的图把 `<source srcset>` 清空、强制回退到 `<img src>`（公共 JPEG），再等 5s；(3) Economist 自带 `@media print { figure, img { display: none } }`，print.css 用 `!important` 反向覆盖 `display/visibility/opacity`
- 待修：首页仍保留少量栏目、导语、插图说明等站点元信息

### `foreignaffairs-china-russia-iran`

- 文件：[reading.pdf](foreignaffairs-china-russia-iran/reading.pdf)、[archive.pdf](foreignaffairs-china-russia-iran/archive.pdf)
- 表现：章节目录基本正确，正文主体完整
- 差异：两版页数相同，主要差异是来源展示方式
- 已修待回归：
  - 之前 `^More by\b` 文本 marker 仍会命中 FA 文章顶部"More by …"侧边栏，`stripFromMarker` 取首个匹配 → 整篇正文被裁。`stripFromMarker` 现在加了位置门槛（marker 必须落在 mainEl 下半部，至少 200px 以下）
- 待修：首屏大图占位、作者简介仍需站点级规则识别

### `cnn-mali-insurgents`

- 文件：[reading.pdf](cnn-mali-insurgents/reading.pdf)、[archive.pdf](cnn-mali-insurgents/archive.pdf)
- 表现：正文抽取完整，文件体积很小
- 差异：归档版多 `1` 页，主要来自归档封面
- 已修待回归：`hideLeadMatches` 现在会同时扫描 `titleEl.closest('header,article')`，下次重打 `UPDATED 2 HR AGO` / `Story by Reuters` 应被裁掉

### `carnegie-ai-labor-debate`

- 文件：[reading.pdf](carnegie-ai-labor-debate/reading.pdf)、[archive.pdf](carnegie-ai-labor-debate/archive.pdf)
- 表现：阅读版已去掉 `Acknowledgments`、`About the Author`、`More Work from Carnegie...` 和机构免责声明
- 差异：归档版保留 `Notes`，因此比阅读版多 `6` 页
- 备注：这是当前长文样张里最适合做回归基线的一篇

### `csis-wartime-oil-prices`

- 文件：[reading.pdf](csis-wartime-oil-prices/reading.pdf)、[archive.pdf](csis-wartime-oil-prices/archive.pdf)
- 表现：正文主体尚可，首图正常保留
- 差异：两版页数已经对齐
- 已修待回归：TOC 黑名单已加 `Related Content / Recommended / See Also` 等噪声标题；`isSupplementalNode` 文本规则也补了同名条目
- 待修：作者行混入栏目名与日期（`Critical Questions by ... Published April 24, 2026`）需站点规则单独清洗；尾部 `Tags` / 免责声明仍在

## 使用建议

- 新规则回归时，优先重打 `newyorker-jd-vance`、`foreignaffairs-china-russia-iran`、`cnn-mali-insurgents`、`csis-wartime-oil-prices`
- 体积优化回归时，优先重打 `wsj-united-card-counting`
- 长文抽取回归时，优先重打 `carnegie-ai-labor-debate`
