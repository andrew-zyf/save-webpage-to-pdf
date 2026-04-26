# Changelog

All notable changes to this project will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-04-26

First Chrome Web Store release.

### Features

- One-click "Save current article as A4 portrait PDF" via toolbar icon, page right-click, or keyboard shortcut `Shift + Option + P` (macOS) / `Shift + Alt + P` (Windows / Linux).
- Auto-extracts **title / author / author bio / body** and renders an archive-style PDF with a generated cover page (date · title · byline · author cards · source URL) and an automatic table of contents (h2/h3, page numbers via CSS `target-counter()`).
- Saves with PDF filename in the format `Publication - Article Title` (e.g. `WSJ - United's Card-Counting CEO…`), by temporarily setting `document.title` before invoking print.
- Image handling: `srcset` resolution selection, blob inlining (bypasses CORS quirks), conservative downsampling for huge images (~2.6 MP threshold), figure + caption grouping so they never split across pages.
- Layout: 158 mm body column, 166 mm cover column, 255 mm image height cap, unified serif fallback (Georgia / Songti / Noto Serif CJK), forced light color scheme to override site dark modes.
- Auto-expands `<details>` and "Show more" buttons to surface lazy-mounted content; restores DOM on `afterprint`.
- Hides ad placeholders, listen/share/print/subscribe buttons, sticky/fixed widgets under 30% of the viewport, and recirculation cards at article tails.

### Site rules

Built-in extraction + cleanup rules for:

- `carnegieendowment.org`
- `cnn.com`
- `csis.org`
- `economist.com`
- `foreignaffairs.com`
- `newyorker.com`
- `wsj.com`

Other sites fall through to a generic paragraph-scoring extractor that selects the highest-scoring `<p>` container while penalising link-heavy regions (sidebars, recirc).

### Notable internals

- **iframe sandbox print path** for The Economist: clones the cover + body into a hidden iframe with a self-contained `IFRAME_CSS`, then calls `iframe.contentWindow.print()`. Eliminates the Skia ghost-paint / inter-page text-tearing class of bugs that pure CSS workarounds could not solve. Other sites currently keep the original `window.print()` path; broader rollout is gated on hardening image cloning into the sandbox.
- **Per-site CSS overrides** are scoped via a `body.a4lp-print-root.a4lp-site-<host>` class to keep one site's hack from leaking into another.
- **Foreign Affairs** body font scales down 36 %; **The New Yorker** body font is set to 12 pt (≈ 16 px) to override an internal `.body__inner-container` font-size that otherwise wins specificity.
- **CSIS / Carnegie** hide the first content image to avoid the cover hero being repeated on page 2.
- **Foreign Affairs / Economist** use bespoke author-bio detection (`FA_AUTHOR_BIO_RE`) and pre-lead extraction (`moveEconomistPreLeadToCover`).
- **The New Yorker** runs `sweepListen` / `hideNYPreLeadWidgets` to scrub Listen widgets that escape generic toolbar matching.
- **WSJ** removes "What to Read Next" / "More From WSJ" / Most Popular / Buy Side / reprints disclaimer at the article tail.

### Permissions

- `activeTab` — read/modify the current tab on user invocation.
- `scripting` — inject `flow.js` / `print.css` into the active tab.
- `contextMenus` — register the right-click menu entry.

No `host_permissions`, no remote code, no analytics. See [PRIVACY.md](PRIVACY.md).
