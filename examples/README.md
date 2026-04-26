# Examples

这批样张生成于 `2026-04-26`，用于对比 `阅读版` 与 `归档版` 两种输出，并持续回归站点规则。

每个样张目录都包含：

- `reading.pdf`：阅读版
- `archive.pdf`：归档版

## 对比总览

| 目录 | 站点 | 原文 URL | 阅读版 | 归档版 | 当前结论 |
| --- | --- | --- | --- | --- | --- |
| `wsj-united-card-counting` | WSJ | `https://www.wsj.com/business/airlines/united-airlines-ceo-scott-kirby-delta-american-11621d97` | `10` 页 / `17.8 MB` | `11` 页 / `17.8 MB` | 头尾清理稳定；主要剩余问题是图片导致体积偏大 |
| `newyorker-jd-vance` | The New Yorker | `https://www.newyorker.com/magazine/2026/04/27/j-d-vances-bumpy-ride` | `5` 页 / `125 KB` | `6` 页 / `179 KB` | 作者抽取已修正为单作者；首页仍残留 `Listen • 7 minutes` |
| `economist-rhetoric-of-war` | The Economist | `https://www.economist.com/culture/2026/04/23/the-rhetoric-of-war-has-changed-not-for-the-better` | `5` 页 / `216 KB` | `6` 页 / `215 KB` | `Explore more` / edition / recirc 尾页已清掉；首页仍保留栏目与插图元信息 |
| `foreignaffairs-china-russia-iran` | Foreign Affairs | `https://www.foreignaffairs.com/united-states/how-china-and-russia-can-exploit-iran-war` | `10` 页 / `3.04 MB` | `10` 页 / `3.03 MB` | 目录可用；正文前作者简介与 `More by` 仍未清掉 |
| `cnn-mali-insurgents` | CNN | `https://edition.cnn.com/2026/04/25/africa/mali-bamako-gunmen-attacks-intl` | `5` 页 / `131 KB` | `6` 页 / `132 KB` | 作者已标准化为 `Reuters`；正文前 `UPDATED` 与 `Story by Reuters` 仍重复 |
| `carnegie-ai-labor-debate` | Carnegie Endowment | `https://carnegieendowment.org/research/2026/04/the-ai-labor-debate-three-views-on-the-future-of-work` | `26` 页 / `2.67 MB` | `32` 页 / `2.80 MB` | 阅读版已裁掉尾部附录与免责声明；归档版保留注释更完整 |
| `csis-wartime-oil-prices` | CSIS | `https://www.csis.org/analysis/how-interpret-wartime-oil-prices` | `6` 页 / `548 KB` | `7` 页 / `546 KB` | 当前问题最多：作者行污染、目录误抓 `Related Content`、文末免责声明与推荐流残留 |

## 逐项说明

### `wsj-united-card-counting`

- 文件：`examples/wsj-united-card-counting/reading.pdf`、`examples/wsj-united-card-counting/archive.pdf`
- 表现：封面不重复，目录未混入推荐流，作者简介 / Buy Side / 文末推荐已清掉
- 差异：归档版仅比阅读版多 `1` 页，主要来自完整来源 URL 和归档抬头

### `newyorker-jd-vance`

- 文件：`examples/newyorker-jd-vance/reading.pdf`、`examples/newyorker-jd-vance/archive.pdf`
- 表现：多作者串、`Comment`、图片署名已经清理
- 差异：归档版额外保留作者卡；阅读版更紧凑
- 待修：首页 `Listen • 7 minutes`

### `economist-rhetoric-of-war`

- 文件：`examples/economist-rhetoric-of-war/reading.pdf`、`examples/economist-rhetoric-of-war/archive.pdf`
- 表现：推荐流、edition CTA、`More from Culture` 已被裁掉
- 差异：归档版保留完整 URL，阅读版更短
- 待修：首页仍保留栏目、导语、插图说明等站点元信息；部分插图可能因浏览器打印策略不入 PDF

### `foreignaffairs-china-russia-iran`

- 文件：`examples/foreignaffairs-china-russia-iran/reading.pdf`、`examples/foreignaffairs-china-russia-iran/archive.pdf`
- 表现：章节目录基本正确，正文主体完整
- 差异：两版页数相同，主要差异是来源展示方式
- 待修：作者简介、`More by ...`、首屏大图占位仍影响版面

### `cnn-mali-insurgents`

- 文件：`examples/cnn-mali-insurgents/reading.pdf`、`examples/cnn-mali-insurgents/archive.pdf`
- 表现：正文抽取完整，文件体积很小
- 差异：归档版多 `1` 页，主要来自归档封面
- 待修：`UPDATED ...` 和 `Story by Reuters` 与封面 byline 重复

### `carnegie-ai-labor-debate`

- 文件：`examples/carnegie-ai-labor-debate/reading.pdf`、`examples/carnegie-ai-labor-debate/archive.pdf`
- 表现：阅读版已去掉 `Acknowledgments`、`About the Author`、`More Work from Carnegie...` 和机构免责声明
- 差异：归档版保留 `Notes`，因此比阅读版多 `6` 页
- 备注：这是当前长文样张里最适合做回归基线的一篇

### `csis-wartime-oil-prices`

- 文件：`examples/csis-wartime-oil-prices/reading.pdf`、`examples/csis-wartime-oil-prices/archive.pdf`
- 表现：正文主体尚可，首图正常保留
- 差异：归档版只多 `1` 页
- 待修：作者行混入栏目名与日期、目录误抓 `Related Content`、尾部 `Tags` / 免责声明 / `Related Content` 仍在

## 使用建议

- 新规则回归时，优先重打 `newyorker-jd-vance`、`foreignaffairs-china-russia-iran`、`cnn-mali-insurgents`、`csis-wartime-oil-prices`
- 体积优化回归时，优先重打 `wsj-united-card-counting`
- 长文抽取回归时，优先重打 `carnegie-ai-labor-debate`
