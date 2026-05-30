# flow.js WSJ-only 简化 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete dead/over-general code from `flow.js` (WSJ-only since v1.1.0), keeping the 9-stage `pdfFlow()` structure and every behavior the 5 existing tests pin.

**Architecture:** Pure deletion refactor. Every deletion cluster is verified by running the full 5-test suite. Green = code was dead, keep the deletion. Red = code is load-bearing, revert that cluster. The plan has two phases: Phase 1 (safe deletions — all paths agree the code is unreachable), Phase 2 (gray items — code that isn't test-pinned but changes behavior on non-WSJ pages; surfaced one-by-one for user decision).

**Tech Stack:** Node.js, Playwright (chromium-headless-shell), existing test suite.

**Status: ✅ COMPLETED**

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
| `flow.js` | Modify | Delete dead code, fix header. 1759 → 1714 lines (−45). |
| `docs/ARCHITECTURE.md` | Modify | Rewrite for WSJ-only reality (was describing 7 sites). |

---

## Phase 1: Safe Deletions (test-green throughout) ✅

### Task 1: Fix misleading file header ✅
- [x] Replace lines 1-2 of `flow.js`
- [x] Run all 5 tests → green
- [x] Commit `0569d98` — Fix misleading file header comment

### Task 2: Remove `off()` / `disable` indirection ✅
- [x] Delete `off()` definition
- [x] Inline 7 always-on guards (remove `if` wrapper, keep body)
- [x] Delete TOC — `renderToc()`, `tocHtml`, and TOC-page injection (~40 lines)
- [x] Remove `disable` from destructuring and `pickContent` return
- [x] Run all 5 tests → green
- [x] Commit `7e3a001` — Remove off()/disable indirection; delete dead TOC path

### Task 3: Remove references to deleted sites in comments ✅
- [x] Fix 6 comments referencing Economist/CNN/Carnegie/CSIS/NYT
- [x] Run all 5 tests → green
- [x] Commit `779bc85` — Clean up comments referencing removed sites

### Task 4: Rewrite `docs/ARCHITECTURE.md` for WSJ-only reality ✅
- [x] Rewrite to cover: module overview, 9-stage pipeline (no TOC), DOM contract, extractor (WSJ + generic fallback), printer (no iframe sandbox), change-loc lookup, WSJ-specific logic, adding a site, global defaults, known limits
- [x] Commit `2ec629c` — Rewrite ARCHITECTURE.md for WSJ-only reality

---

## Phase 2: Gray Items (user decision required per item) ✅

### Gray Item A: `isSupplementalNode` — Carnegie regex arms ✅ DELETED
- User decision: **delete**
- Removed "more work from carnegie endowment for international peace" from alternation and standalone `/^carnegie does not take institutional positions/i` check
- Commit `8382aca` — Remove Carnegie-specific regex arms from isSupplementalNode

### Gray Item B: `cleanAuthor` — CSIS/Carnegie author-prefix stripping ✅ KEPT
- `.replace(/^\s*(critical questions|commentary|analysis|brief(?:ing)?|report)\s+by\s+/i, '')`
- User decision: **keep** — harmless, non-CSIS text won't match

### Gray Item C: `isSupplementalNode` — Listen/sound regex ✅ KEPT
- Generic Listen-duration pattern in existing alternation
- Recommendation was keep — user concurred (no action needed)

### Gray Item D: Ghost deduplication (step 5d / 5d.6, ~80 lines) ✅ KEPT
- Defensive `isSubsequenceOverlap` logic for web-font ghost rendering
- Recommendation was keep — user concurred (no action needed)

---

## Scope Discovery

During implementation planning, a key finding reshaped the original scope:

**2 of 5 tests run on non-WSJ hosts:**
- `image-preservation.test.js` → `www.csis.org`
- `data-svg-preservation.test.js` → `example.test`

These tests exercise the **generic fallback path** (no `SITE_RULES` match → mainEl scoring, generic title heuristic, generic image handling). This means the originally planned "delete generic byline/bio/mainEl fallback heuristics" (original spec §3) is **not safe** — those paths are test-pinned. The plan was adjusted to only delete code that is provably dead across all execution paths.

---

## Final Result

| Metric | Before | After |
|---|---|---|
| `flow.js` lines | 1759 | 1714 (−45) |
| `off()`/`disable` switches | 8 | 0 |
| Dead TOC path | ~40 lines | deleted |
| Removed-site comments | 6 stale refs | cleaned |
| `ARCHITECTURE.md` | 7-site + iframe sandbox | WSJ-only |
| Tests | 5/5 green | 5/5 green |

All 5 implementation commits:
```
8382aca Remove Carnegie-specific regex arms from isSupplementalNode
2ec629c Rewrite ARCHITECTURE.md for WSJ-only reality
779bc85 Clean up comments referencing removed sites
7e3a001 Remove off()/disable indirection; delete dead TOC path
0569d98 Fix misleading file header comment
```
