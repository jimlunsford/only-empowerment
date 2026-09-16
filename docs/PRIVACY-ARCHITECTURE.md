# Privacy architecture

## Current implementation

No account, cookies, localStorage, sessionStorage, IndexedDB, service worker, server answer endpoint, database, analytics, advertising, session replay, third-party forms, remote fonts, or AI API.

The interaction preview stores its single response in component memory. Leaving the preview unmounts it. Refreshing discards app memory. Clear preview confirms and clears the response and generated card. Browser form restoration, page snapshots, extensions, or device-level capture can persist outside app control; do not promise secure erasure.

| Data | Location / lifetime | Network / deletion |
| --- | --- | --- |
| Response and sample card | In-memory component state until clear, route exit, or reload | No intentional transmission; clear removes app state |
| App JS/CSS/HTML/icon | Host and ordinary browser HTTP cache | Downloaded on visit; no private answers in assets |
| Build version, commit, checksums | Public static build | Public, non-personal metadata |
| IP, requested path, request metadata | Host/network operational systems | Ordinary requests expose these; exact retention is deployment-specific |
| Copied card | OS clipboard, possibly synced | Explicit user action; app cannot delete downstream copies |
| Printed card / PDF | Browser/OS/printer/file destination | Explicit user action; managed outside app |
| External links | GitHub or JimLunsford.com after user click | No answers in link; no-referrer policy |

## Data flow

Host → browser: static application assets. Browser memory → rendered DOM: local response and card. Browser memory → clipboard/print: only after the user acts. Browser → host: requests for static assets, never answer payloads by design. GitHub is the source/build platform, not an answer processor. Framework links are references, not embedded third-party content.

Production and staging are different origins and must never share browser storage or draft data. If later saved work exists, moving from staging to production requires user-directed export/import. No invisible migration or syncing.

## Planned v1 persistence, not implemented

Memory is default. Offer an explicit “Save on this device” action with a shared-device warning. Use a versioned `oe:` storage namespace and schema validation. Saved records persist until deletion, site-data clearing, browser eviction, or device loss. There is no guaranteed retention and no server recovery.

Before shipping saving, implement “Delete my local data” in the main privacy/settings surface and per-record delete. Explain exact scope, confirm, remove all app-owned versions/keys, clear current memory, synchronize deletion across open tabs, and verify removal. Do not use localStorage.clear() because it may remove unrelated data. Storage denial, quota limits, corrupted records, unknown versions, and migration failure must preserve user control and never report a false save or successful deletion.

Do not claim encryption at rest. Same-origin JavaScript and extensions may read browser storage. Encryption without a user-held secret does not solve a compromised application. IndexedDB is unnecessary for a few text artifacts; reconsider only when measured complexity warrants it.

## Telemetry and network rules

No analytics in Phase 1 or v1 baseline. Do not introduce fetch, XHR, sendBeacon, WebSocket, external fonts, third-party JS, remote images, reporting endpoints, or form submission without a documented need and privacy review. No free text in logs, error reporting, URLs, titles, or CI fixtures. Synthetic test inputs only.

Use CSP `connect-src 'none'`, `form-action 'none'`, `object-src 'none'`, and local-only scripts/styles/assets. This is defense in depth, not proof of no possible exfiltration. External navigation remains possible. Host headers must add frame-ancestors because HTML meta cannot enforce it. Development HMR may need a separate developer policy; test the production build for privacy behavior.

## Threat considerations

XSS can read memory or future saved records. Use framework-escaped text; forbid unsafe HTML, dynamic script evaluation, and user-controlled URLs. Public source cannot establish deployment integrity alone. Host compromise, supply-chain compromise, malicious browser extensions, shared devices, clipboard sync, print spooling, and screenshots remain limits.

A public build commit and checksums provide inspectable traceability, not cryptographic proof that the host is trustworthy. CI artifacts and an independently obtained release manifest enable meaningful byte comparison. Do not serve source repositories, `.env`, private backups, or deployment credentials from the web root.

## Audit gates

Inspect runtime source and dependencies; assert no persistence APIs in current source; capture browser requests while entering a unique synthetic marker; verify only local asset GETs and no marker in URLs/bodies; verify clear, route exit, reload, copy failure, text escaping, CSP and security headers. Inspect host logging and retention separately before publishing a complete infrastructure privacy statement. Automated tests cannot prove behavior of every device, extension, or compromised host.

## Observed staging host behavior, 2026-09-16

Staging is now deployed. The live browser matrix observed only same-origin static GET requests during synthetic answer entry, edit, clear, reload and navigation. No synthetic answer marker appeared in the captured URLs or request bodies. Cookies, localStorage, sessionStorage, IndexedDB, Cache Storage and service-worker registrations were empty in fresh test contexts. No analytics, AI, remote-font, third-party-script or form-processor traffic appeared. These are observed results for exercised paths, not a universal privacy proof.

The host has separate Nginx access and error logs. Its current shared logrotate policy runs daily, retains up to 14 rotated logs, compresses older logs and skips empty files. That is not a guaranteed 14-calendar-day erasure promise. Exact server-wide backup retention and any provider logs must be treated separately; no claim that every infrastructure copy disappears after 14 days is made. The established backup standard lists 7 daily, 4 weekly and 12 monthly snapshots, but this execution did not independently re-audit all backup exclusions or provider log retention. The application has no answer submission, so ordinary application use does not place answers in these access logs by design.

The unchanged foundation privacy page retains conservative language about deployment-specific logs. Current verified host details and remaining limits are recorded in STAGING-ACCEPTANCE-2026-09-16.md. Do not add a stronger deletion guarantee without its own infrastructure evidence.
