# flow.js WSJ-only 简化（pure A：删除死代码，结构不变）

日期：2026-05-31
状态：**已完成**

## 背景

扩展在 v1.1.0 已转为 **WSJ 专版**（移除 Carnegie / CNN / CSIS / Economist /
Foreign Affairs / New Yorker 六站规则），但 `flow.js`（1759 行单体文件）仍保留
为这七站构建的通用多站点机制。`docs/ARCHITECTURE.md` 也仍按 7 站描述，与现状
严重不符。

本次重构目标：**简化复杂逻辑**，删除死代码与过度通用层，保持单文件、
保持 `pdfFlow()` 9 阶段结构不变。

## 原则（pure A）

- 删除死代码 / 过度通用的间接层。
- **不**做函数提取、重命名、阶段重排、文件拆分。
- 不移动 `pdfFlow()` 闭包内的共享状态（`cleanupActions` / `mainEl` 等）。
- 不改变任何测试锁定的行为。

## 方法：测试即裁判

存在绿色基线：5 个测试当前全部通过（Playwright chromium 已安装）。
"死代码" 因此是**可验证的**，而非主观判断：

> 删除一个代码簇 → 跑全部 5 个测试 → 绿则该代码确为死代码，删除保留；
> 红则它是承重代码，回退这一处删除。

每个删除簇后跑全套测试，在逻辑检查点提交，保证任何回归可二分定位。

## 范围发现（实施前调整）

实施前发现 **2 个浏览器测试跑在非 WSJ host 上**：
- `image-preservation.test.js` → `www.csis.org`
- `data-svg-preservation.test.js` → `example.test`

这两个测试走的是**通用 fallback 路径**（无 `SITE_RULES` 匹配时的 mainEl 评分、
通用标题启发式、通用图片处理），即原设计第 3 节"通用 byline/bio/mainEl fallback
启发式"想要删除的代码。结论：这些通用路径**被测试钉住，不是死代码**，不能删。

设计因此分为两阶段：Phase 1（安全删除）、Phase 2（灰色项逐一确认）。

## 已完成的删除

### Phase 1：安全删除（测试全绿）

#### 1. 误导的文件头 ✅
"Auto-generated combined flow file" → 改为描述手维护注入文件的真实情况。
（`0569d98`）

#### 2. `off()`/`disable` 间接层 + 死 TOC 路径 ✅
- 删除 `off()` helper 与 8 处 `off('…')` 开关。7 个非 toc 开关恒为开
  → 去掉守卫，保留分支体。`toc` 永久关闭 → 删除 `renderToc()` 及全部 TOC 逻辑
  （~40 行）。删除 `SITE_RULES['wsj.com'].disable` 属性和 `pickContent()` 返回值
  中的 `disable` 字段。
（`7e3a001`）

#### 3. 已移除站点的注释 ✅
修正 6 处引用 Economist/CNN/Carnegie/CSIS/NYT 的注释，改为通用描述。
（`779bc85`）

#### 4. `docs/ARCHITECTURE.md` 重写 ✅
从 7 站描述 + iframe 沙箱路径重写为 WSJ-only 现状。
（`2ec629c`）

### Phase 2：灰色项（逐一确认）

#### Gray A: Carnegie 正则臂 ✅ 已删除
`isSupplementalNode` 中 "more work from carnegie endowment for international
peace" 和 "carnegie does not take institutional positions" 两条 Carnegie 专属
正则。用户确认删除。（`8382aca`）

#### Gray B: `cleanAuthor` CSIS/Carnegie 前缀剥离 ✅ 保留
`cleanAuthor` 中 `(critical questions|commentary|analysis|brief(?:ing)?|report)\s+by\s+`
正则剥离。用户决定保留——无害，非 CSIS 文本不会匹配。

#### Gray C: Listen/sound 正则 ✅ 保留（计划推荐保留）
`isSupplementalNode` 中 Listen 时长模式——通用模式，非站点专属。

#### Gray D: Ghost 去重 step 5d/5d.6 ✅ 保留（计划推荐保留）
~80 行 `isSubsequenceOverlap` 逻辑——防御性代码，任何站点的 web-font 加载
异常都可能触发。

## 明确保留（测试锁定 / 设计决策）

- **通用 mainEl 评分 / 通用标题 / 通用图片路径**：被 csis.org 和 example.test
  两个浏览器测试钉住。
- **重构正文路径**：`buildReconstructedMain`、`isSupplementalNode`、
  `ORPHAN_WIDGET_TEXT_RE`、`a4lp-reconstructed`、延迟 cleanup。
- **全部 `a4lp-*` contract class**。
- **图片内联 / 压缩 / srcset / picture 处理；SVG 保留**。
- **封面 hero 选择**；`cleanup()` / `cleanupActions`。
- **`cleanAuthor` 中 CSIS/Carnegie 栏目前缀正则**（用户决策保留）。
- **Ghost 去重 step 5d/5d.6**（防御性代码，保留）。
- **Listen 时长正则**（通用模式，保留）。

## 结果

| 指标 | 前 | 后 |
| --- | --- | --- |
| `flow.js` 行数 | 1759 | 1714（−45） |
| `off()`/`disable` 开关 | 8 处 | 0 |
| 死 TOC 路径 | ~40 行 | 已删 |
| 已移除站注释 | 6 处陈旧引用 | 已清理 |
| `ARCHITECTURE.md` | 描述 7 站 + iframe 沙箱 | WSJ-only |
| 测试 | 5/5 绿 | 5/5 绿 |

提交历史（5 个实现提交）：
```
8382aca Remove Carnegie-specific regex arms from isSupplementalNode
2ec629c Rewrite ARCHITECTURE.md for WSJ-only reality
779bc85 Clean up comments referencing removed sites (Economist/CNN/Carnegie/CSIS/NYT)
7e3a001 Remove off()/disable indirection; delete dead TOC path
0569d98 Fix misleading file header comment
```

## 不在范围
函数提取 / 重命名、阶段重排、文件拆分、任何行为变更。
