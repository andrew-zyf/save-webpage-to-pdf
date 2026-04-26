# Changelog

## [1.0.1] — 2026-04-26

Cover layout polish + clickable multi-line source URL.

- **Author bio moved under the BY line**, between title block and hero image, so the byline + bio sit as one visual unit on page 1 across all sites.
- **Hero image caption** (figcaption / caption-class sibling / `alt` fallback) extracted and rendered under the cover image as italic centered text. Affects sites whose hero image has a credit / caption (CSIS, WSJ, Foreign Affairs, etc.).
- **SOURCE URL** rendered as a real `<a href>` instead of plain text so that every line of a wrapped multi-line URL is clickable in the saved PDF (Chrome's auto-detection only linked the first line).

## [1.0.0] — 2026-04-26

First Chrome Web Store release.

Built-in extraction + cleanup rules for `carnegieendowment.org`, `cnn.com`, `csis.org`, `economist.com`, `foreignaffairs.com`, `newyorker.com`, `wsj.com`. Other sites fall through to a generic paragraph-scoring extractor.

Architecture, per-site internals, and global defaults: see [docs/ARCHITECTURE](docs/ARCHITECTURE.md). Permission and data handling: see [PRIVACY](PRIVACY.md).
