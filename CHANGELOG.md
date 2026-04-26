# Changelog

## [1.0.0] — 2026-04-26

First Chrome Web Store release. Detailed feature list and architecture in [README](README.md); permission and data handling in [PRIVACY](PRIVACY.md); per-site rules in [docs/SITE_CUSTOMIZATION](docs/SITE_CUSTOMIZATION.md).

### Supported sites

Built-in extraction + cleanup rules for `carnegieendowment.org`, `cnn.com`, `csis.org`, `economist.com`, `foreignaffairs.com`, `newyorker.com`, `wsj.com`. Other sites fall through to a generic paragraph-scoring extractor.

### Notable internals

- **iframe sandbox print path** for The Economist (`printViaIframe`): clones the cover + body into a hidden iframe with a self-contained `IFRAME_CSS`, then calls `iframe.contentWindow.print()`. Eliminates the Skia ghost-paint / inter-page text-tearing class of bugs that pure CSS workarounds could not solve. Other sites currently keep the original `window.print()` path; broader rollout is gated on hardening image cloning into the sandbox.
- **Per-site CSS overrides** are scoped via `body.a4lp-print-root.a4lp-site-<host>` so one site's hack never leaks into another.
- **Foreign Affairs** body font scales down 36 %; **The New Yorker** body font is set to 12 pt (≈ 16 px) to override an internal `.body__inner-container` font-size that otherwise wins specificity.
- **CSIS / Carnegie** hide the first content image to avoid the cover hero being repeated on page 2.
- **Foreign Affairs / Economist** use bespoke author-bio detection (`FA_AUTHOR_BIO_RE`) and pre-lead extraction (`moveEconomistPreLeadToCover`).
- **The New Yorker** runs `sweepListen` / `hideNYPreLeadWidgets` to scrub Listen widgets that escape generic toolbar matching.
- **WSJ** removes "What to Read Next" / "More From WSJ" / Most Popular / Buy Side / reprints disclaimer at the article tail.
- **Cover URL** rendered as a real `<a href>` so multi-line URLs are clickable across all rows in the saved PDF.
