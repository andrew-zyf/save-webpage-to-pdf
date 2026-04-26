# Privacy Policy — Save Webpage to PDF

_Last updated: 2026-04-26_

**Save Webpage to PDF does not collect, store, or transmit any user data.**

## What the extension does

All page processing happens locally inside your browser. When you explicitly
invoke the extension — by clicking the toolbar icon, choosing the right-click
menu entry, or pressing the configured keyboard shortcut — it reads the DOM of
the tab you are currently viewing, builds a print-friendly layout (cover, table
of contents, body), and immediately hands off to Chrome's native print dialog
so you can save the result as a PDF on your own device.

The extension never runs on a tab unless you explicitly invoke it.

## What is sent over the network

Nothing. The extension contains no analytics, no telemetry, no error reporting,
and makes no requests to any author-controlled or third-party server. The only
network activity it triggers is fetching images that are already present on the
active page, in order to inline them into the local PDF — these requests go
directly from your browser to the same image hosts the page itself uses.

## What is stored

Nothing persistent. The extension declares no `storage` permission and creates
no cookies. Temporary DOM modifications made during a save (hidden ads,
inserted cover, etc.) are reverted as soon as the print dialog closes.

## Permissions used

- **`activeTab`** — read and modify the DOM of the tab you invoked the
  extension on, only at the moment of invocation.
- **`scripting`** — inject the bundled content script and CSS into the active
  tab. Injection only happens on user invocation.
- **`contextMenus`** — register the right-click "Save Webpage to PDF" entry.

The extension does not request `host_permissions` and does not run in the
background or on any tab the user has not explicitly invoked it on.

## Remote code

The extension contains no remote code. All JavaScript and CSS is bundled in
the extension package. There is no `eval`, no `new Function(string)`, and no
`<script src="https://...">` injection.

## Children's privacy

The extension neither collects nor processes any data and is not directed at
children specifically.

## Contact

Source code: https://github.com/andrew-zyf/save-webpage-to-pdf

Issues / questions: https://github.com/andrew-zyf/save-webpage-to-pdf/issues
