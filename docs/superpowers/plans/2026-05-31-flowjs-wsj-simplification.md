# flow.js WSJ-only 简化 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete dead/over-general code from `flow.js` (WSJ-only since v1.1.0), keeping the 9-stage `pdfFlow()` structure and every behavior the 5 existing tests pin.

**Architecture:** Pure deletion refactor. Every deletion cluster is verified by running the full 5-test suite. Green = code was dead, keep the deletion. Red = code is load-bearing, revert that cluster. The plan has two phases: Phase 1 (safe deletions — all paths agree the code is unreachable), Phase 2 (gray items — code that isn't test-pinned but changes behavior on non-WSJ pages; surfaced one-by-one for user decision).

**Tech Stack:** Node.js, Playwright (chromium-headless-shell), existing test suite.

**Verification command (run after every task):**
```bash
cd /Users/az/Projects/claude/repos/save-wsj-webpage-to-pdf
for t in tests/*.test.js; do node "$t" 2>&1 | tail -1; done
```
Expected output (all 5 lines):
```
data svg preservation ok
image preservation ok
print layout contract ok
reconstructed print contract ok
wsj reconstruction ok
```

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `flow.js` | Modify | Delete dead code, fix header. 1759 lines → ~1400 lines. |
| `docs/ARCHITECTURE.md` | Modify | Rewrite for WSJ-only reality (currently describes 7 sites). |

---

## Phase 1: Safe Deletions (test-green throughout)

### Task 1: Fix misleading file header

**Files:**
- Modify: `flow.js:1-2`

The header says "Auto-generated combined flow file" but there is no generator — it's hand-maintained and injected directly by `chrome.scripting.executeScript`.

- [ ] **Step 1: Replace lines 1-2 of `flow.js`**

Change from:
```js
// Auto-generated combined flow file. Safe to inject multiple times —— 每次都
// 重新执行 IIFE 重写 window.__a4lpStart，避免扩展 reload 后老页面仍指向旧闭包。
```
To:
```js
// Main content-extraction + print-pipeline for the Save WSJ Webpage to PDF
// extension. Wrapped in IIFE for safe multi-inject —— each call overwrites
// window.__a4lpStart so stale closures from a previous extension load are
// replaced.
```

- [ ] **Step 2: Run all 5 tests**

Run: verification command above.
Expected: all 5 pass.

- [ ] **Step 3: Commit**

```bash
git add flow.js
git commit -m "Fix misleading file header comment"
```

---

### Task 2: Remove `off()` / `disable` indirection

**Files:**
- Modify: `flow.js:567` (remove `off()` definition)
- Modify: `flow.js:633` (inline `fixedHide` guard)
- Modify: `flow.js:646` (inline `extraRemove` guard)
- Modify: `flow.js:654` (inline `adText` guard)
- Modify: `flow.js:694` (inline `actionButton` guard)
- Modify: `flow.js:971` (inline `trailingCardStrip` guard)
- Modify: `flow.js:1020` (inline `keepPath` guard)
- Modify: `flow.js:1269` (inline `toc` guard — permanently off for WSJ)
- Modify: `flow.js:1318` (inline `figureGroup` guard)

`SITE_RULES['wsj.com'].disable` is `['toc']`. All other switches are always-on (not in `disable`). The `off()` helper and every `if (!off('X'))` guard can be replaced:

- For **always-on** switches (`fixedHide`, `extraRemove`, `adText`, `actionButton`, `trailingCardStrip`, `keepPath`, `figureGroup`): remove the `if (!off('X'))` wrapper, keep the body. For `figureGroup`, the `if (off('figureGroup')) { /* skip */ } else {` becomes just the body (remove the else wrapper).
- For **always-off** (`toc`): `renderToc()` returns `''` immediately because `off('toc')` is always true. The entire `renderToc` function, the `tocHtml` variable, and the TOC-page injection block are dead. Delete them.

- [ ] **Step 1: Delete `off()` definition at line 567**

Remove:
```js
  const off = (key) => Array.isArray(disable) && disable.includes(key);
```

- [ ] **Step 2: Inline 7 always-on guards (remove `if` wrapper, keep body)**

At each of these lines, remove the `if (!off('X')) {` line and its closing `}`, keeping the body unchanged:
- Line ~633: `if (!off('fixedHide')) {` → remove wrapper
- Line ~646: `if (extraRemove && !off('extraRemove')) {` → change to `if (extraRemove) {`
- Line ~654: `if (!off('adText')) {` → remove wrapper
- Line ~694: `if (!off('actionButton')) {` → remove wrapper
- Line ~971: `if (mainEl && !off('trailingCardStrip')) {` → change to `if (mainEl) {`
- Line ~1020: `if (!off('keepPath')) {` → remove wrapper
- Line ~1318: `if (off('figureGroup')) { /* skip */ } else {` → remove entire if/else wrapper, keep the body

- [ ] **Step 3: Delete TOC — `renderToc()`, `tocHtml`, and TOC-page injection**

At ~line 1251-1290, delete the following:
- `TOC_BLACKLIST_RE` constant (line ~1251)
- `tocMinHeadings` / `separateToc` variables (lines ~1266-1267)
- The entire `renderToc` function (lines ~1268-1282)
- `const tocHtml = renderToc();` (line ~1283)
- The two TOC injection blocks:
  ```js
    if (tocHtml && !separateToc) {
      html += tocHtml;
    }
  ```
  and
  ```js
    if (tocHtml && separateToc) {
      html += '<section class="a4lp-toc-page">' + tocHtml + '</section>';
    }
  ```
- In the diagnostic log object (~line 1307), remove `tocEntries` and `separateToc` if present.

- [ ] **Step 4: Remove `disable` from destructuring and `pickContent` return**

At line ~562, remove `disable` from the destructuring:
```js
  const { titleEl, mainEl, commentEls, extraRemove, authorText: extractedAuthorText, authorBios, authorBioEls, safeKeep, disable, rulesMatchedHost } = pickContent(SITE_RULES);
```
→ remove `, disable`.

In `pickContent()` return object (~line 1753), remove:
```js
      disable: Array.isArray(rules?.disable) ? rules.disable : [],
```

- [ ] **Step 5: Run all 5 tests**

Run: verification command.
Expected: all 5 pass.

- [ ] **Step 6: Commit**

```bash
git add flow.js
git commit -m "Remove off()/disable indirection; delete dead TOC path

WSJ's disable: ['toc'] means renderToc() was always a no-op.
The other 7 switches (fixedHide, extraRemove, adText, actionButton,
trailingCardStrip, keepPath, figureGroup) are always-on for WSJ
and for the generic fallback path — the guards were dead branches."
```

---

### Task 3: Remove references to deleted sites in comments

**Files:**
- Modify: `flow.js` (6 locations)

These are comment-only changes — zero behavioral impact. Just clean up stale references.

- [ ] **Step 1: Fix comments referencing removed sites**

1. Line ~299: `// 0b'. 兜底懒加载占位：很多站点（Economist / NYT / FT / CNN 等）只在`
   → Change to: `// 0b'. 兜底懒加载占位：WSJ 等站点只在`

2. Line ~408: `// 但很多站点（WSJ/CSIS 等）img.src 是占位 1×1 gif，srcset 才指向真图，`
   → Change to: `// 很多站点 img.src 是占位 1×1 gif，srcset 才指向真图，`

3. Line ~830: `// 同时扫 mainEl 与 titleEl 的 header/article 祖先 —— CNN/NY 的 UPDATED /`
   → Change to: `// 同时扫 mainEl 与 titleEl 的 header/article 祖先 ——`

4. Line ~889: `// 5d. 邻近段落"半字重复"修复：Economist 等站点会把同一段落渲染两次（一份正常、`
   → Change to: `// 5d. 邻近段落"半字重复"修复：某些渲染异常会把同一段落渲染两次（一份正常、`

5. Line ~931: `// 相似度 ≥ 0.75 的两块，隐藏更短/更破损的（Economist ou marshal not merel`
   → Change to: `// 相似度 ≥ 0.75 的两块，隐藏更短/更破损的（`

6. Line ~1088: `// 而不是仅 mainEl —— CNN 等站点把真正的现场照片放在 .article__content-container`
   → Change to: `// 而不是仅 mainEl —— 部分站点把真正的现场照片放在 .article__content-container`

- [ ] **Step 2: Run all 5 tests**

Run: verification command.
Expected: all 5 pass.

- [ ] **Step 3: Commit**

```bash
git add flow.js
git commit -m "Clean up comments referencing removed sites (Economist/CNN/Carnegie/CSIS)"
```

---

### Task 4: Rewrite `docs/ARCHITECTURE.md` for WSJ-only reality

**Files:**
- Modify: `docs/ARCHITECTURE.md`

The current file describes 7 sites, an iframe sandbox path, and generic multi-site machinery that no longer exists. Rewrite it to match what `flow.js` actually does now (after Tasks 1-3).

- [ ] **Step 1: Rewrite ARCHITECTURE.md**

The new document should cover:
- **Module overview**: `flow.js` (single injected script), `background.js`, `popup.js`, `print.css` — same table but without multi-site notes.
- **Pipeline**: the 9 stages of `pdfFlow()`, updated to reflect TOC removal and the WSJ-only site flag (`isWSJ`).
- **DOM contract classes**: the `a4lp-*` classes — unchanged from current doc, this section is still accurate.
- **Extractor** (`pickContent`): simplified — WSJ explicit selectors + generic fallback (mainEl scoring, title heuristic). Remove the multi-site schema description; describe the single WSJ rule and the generic fallback that runs on unmatched hosts.
- **Printer**: `window.print()` path only (no iframe sandbox). `cleanup()` behavior.
- **Change-loc lookup**: same table structure but WSJ-only.
- **Adding a new site**: keep this section but note it would require adding to `SITE_RULES` and the `isWSJ`-style flag pattern.
- **Known limitations**: update to remove iframe sandbox references.

Keep the document in the same style (Chinese + English mixed, contributor-facing).

- [ ] **Step 2: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "Rewrite ARCHITECTURE.md for WSJ-only reality"
```

---

## Phase 2: Gray Items (user decision required per item)

These are code that no test covers and no WSJ page exercises, but removing them changes behavior on non-WSJ pages. Each item is surfaced individually for your decision before I delete.

### Gray Item A: `isSupplementalNode` — removed-site regex arms

**Location:** `flow.js` lines 605-607

Two regex arms in `isSupplementalNode()` match text patterns specific to removed sites:
```js
// Line 606 (within a long alternation):
// "more work from carnegie endowment for international peace"
// Line 607 (standalone):
/^carnegie does not take institutional positions on public policy issues/i
```

**Impact if deleted:** Carnegie-specific text blocks would no longer be auto-hidden. No test contains this text. No WSJ page produces this text. But if someone uses the extension on a Carnegie page via context-menu, those blocks would remain visible.

**Recommendation:** Delete. The extension is called "Save **WSJ** Webpage to PDF". Carnegie support was explicitly removed in v1.1.0.

---

### Gray Item B: `cleanAuthor` — site-specific prefix stripping

**Location:** `flow.js` line 1621

```js
// 站点栏目前缀（CSIS "Critical Questions by ..."、Carnegie "Commentary by ..." 等）
.replace(/^\s*(critical questions|commentary|analysis|brief(?:ing)?|report)\s+by\s+/i, '')
```

**Impact if deleted:** Author names on CSIS/Carnegie articles would retain the section prefix (e.g. "Critical Questions by Jane Doe" instead of "Jane Doe"). No test exercises this. No WSJ article has this pattern.

**Recommendation:** Delete. Same reasoning as Gray Item A.

---

### Gray Item C: `isSupplementalNode` — Listen/sound-pattern regex arm

**Location:** `flow.js` line 606 (within the long alternation)

The alternation includes:
```
[^A-Za-z0-9]{0,3}\s*listen(?:\s*[•·|]\s*\d+\s*(?:min(?:ute)?s?|sec(?:ond)?s?))?
```

**Impact if deleted:** "Listen · 5 min" type widgets would no longer be auto-classified as supplemental. No test covers this pattern. WSJ's `isWSJ` branch handles Listen differently.

**Recommendation:** Keep. This is a generic pattern (not site-specific) and Listen widgets appear on many sites. Low complexity cost (it's part of an existing alternation).

---

### Gray Item D: Ghost deduplication (step 5d / 5d.6)

**Location:** `flow.js` lines 889-970

The "half-word duplicate" paragraph deduplication originated as an Economist font workaround but is now **site-wide** (runs for all hosts). It adds ~80 lines of `isSubsequenceOverlap` logic.

**Impact if deleted:** Economist-style ghost paragraphs would no longer be auto-hidden. WSJ doesn't produce this artifact. The csis/example tests don't test ghost dedup.

**Recommendation:** Keep. This is a genuine rendering workaround that could affect any site with web-font loading issues. It's defensive and doesn't add branching complexity (it's sequential, unconditional code).

---

## Self-Review

**Spec coverage:** Each section of the design spec maps to a task:
- "SITE_RULES schema indirection" → Task 2
- "Removed-site code" → Task 3 + Phase 2 gray items
- "Generic fallback heuristics" → kept per test findings (csis/example tests pin them)
- "Misleading header" → Task 1
- "ARCHITECTURE.md rewrite" → Task 4

**Placeholder scan:** No TBD/TODO/vague instructions. Every step has exact line references or code.

**Type consistency:** All function names and variable names match their usage in `flow.js` (verified via grep above).

**Scope check:** Single spec, single plan, all tasks produce independently-verifiable changes (test suite green after each).
