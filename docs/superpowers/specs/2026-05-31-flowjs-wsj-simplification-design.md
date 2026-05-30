# flow.js WSJ-only 简化（pure A：删除死代码，结构不变）

日期：2026-05-31
状态：已批准设计，待写实现计划

## 背景

扩展在 v1.1.0 已转为 **WSJ 专版**（移除 Carnegie / CNN / CSIS / Economist /
Foreign Affairs / New Yorker 六站规则），但 `flow.js`（1759 行单体文件）仍保留
为这七站构建的通用多站点机制。`docs/ARCHITECTURE.md` 也仍按 7 站描述，与现状
严重不符。

本次重构目标：**简化复杂逻辑**，删除 WSJ 永远走不到的死代码与过度通用层，
保持单文件、保持 `pdfFlow()` 9 阶段结构不变。

## 原则（pure A）

- 删除死代码 / 过度通用的间接层。
- **不**做函数提取、重命名、阶段重排、文件拆分。
- 不移动 `pdfFlow()` 闭包内的共享状态（`cleanupActions` / `mainEl` 等）。
- 不改变任何测试锁定的行为。

## 方法：测试即裁判

存在绿色基线：5 个测试当前全部通过（Playwright chromium 已安装）。
"WSJ 永远走不到" 因此是**可验证的**，而非主观判断：

> 删除一个代码簇 → 跑全部 5 个测试 → 绿则该代码确为死代码，删除保留；
> 红则它是承重代码，回退这一处删除。

每个删除簇后跑全套测试，在逻辑检查点提交，保证任何回归可二分定位。

## 删除范围（测试导向）

### 1. SITE_RULES schema 间接层
`SITE_RULES` 只有一条 `wsj.com`。将其内联为 WSJ 常量，移除通用层：
- 删除 `off()` helper 与 8 处 `off('…')` / `disable` 开关。
- WSJ `disable: ['toc']` → TOC 永久关闭：`renderToc()` 与目录页逻辑为死代码，删除。
- 其余 7 个开关恒为开 → 去掉守卫，保留分支体。

### 2. 已移除站点的代码
- 引用 Economist / NYT / CNN / Carnegie / CSIS 的注释。
- WSJ 文本无法命中的站点专属 regex 候选项（如 Carnegie "does not take
  institutional positions"、CSIS/Carnegie 栏目前缀剥离）。
- 5d "半字重复" ghost 去重源自 Economist 字体问题、**当前全站启用**：
  先测删除是否致红；若致红则保留。

### 3. 通用 byline / bio / mainEl fallback 启发式
WSJ 显式选择器可覆盖的通用评分链、meta / schema.org / byline fallback。
风险：WSJ 选择器若漏命中则无兜底。行为测试 fixture 即守卫——若依赖某 fallback，
测试致红则保留该分支。

### 4. 误导的文件头
"Auto-generated combined flow file"（无生成器，实为手维护注入文件）→ 改为
描述真实情况。

## 明确保留（测试锁定）
- 重构正文路径：`buildReconstructedMain`、`isSupplementalNode`、
  `ORPHAN_WIDGET_TEXT_RE`、`a4lp-reconstructed`、延迟 cleanup。
- 全部 `a4lp-*` contract class。
- 图片内联 / 压缩 / srcset / picture 处理；SVG 保留。
- 封面 hero 选择；`cleanup()` / `cleanupActions`。

## 连带项（已批准）
- 内联 `SITE_RULES` 为 WSJ 专用常量。
- 修正文件头注释。
- 重写 `docs/ARCHITECTURE.md` 为 WSJ-only 现状。

## 验证
每个删除簇后 5 个测试全绿；检查点提交。预计减少约 300–500 行。

## 不在范围
函数提取 / 重命名、阶段重排、文件拆分、任何行为变更。
