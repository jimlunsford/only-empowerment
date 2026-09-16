# Staging runbook

Status: staging deployed and verified on 2026-09-16. See STAGING-ACCEPTANCE-2026-09-16.md for exact commit, evidence, and limitations. The steps below are the operating standard; the ops/ first-deployment and recovery scripts are historical, narrowly pinned scripts and must not be rerun as a general updater.

Target: dev.onlyempowerment.com. Production apex and www remain untouched. Use current VPS source rules; no parallel backup or server-management system.

## Inspection gate

1. Connect Remote Desktop Commander to vps1.phoenix233.com and verify hostname.
2. Verify narrowly scoped administrative access. Do not change sudoers, SSH, UFW, or credentials to work around an unavailable elevation.
3. Inspect all relevant enabled Nginx blocks, the shared ACME snippet, Certbot renewal convention, default host behavior, root permissions, and existing site content. Stop if this hostname/root already exists unexpectedly.
4. Confirm existing VPS-wide backup health and a rollback path; inspect the established helper rather than assuming its command flags. It covers /var/www and the relevant /etc tree.
5. Inspect authoritative DNS again, including CAA and any dev record. Export/record current records before a DNS write. Do not change apex A/AAAA, nameservers, MX, TXT, DKIM, DMARC, or unrelated services.

## Code and build gate

Use the reviewed PR head or accepted main with an exact recorded commit. Clone outside the web root as the ordinary deployment identity. Require a clean checkout, npm ci, unit/build checks, and passing CI. Build with OE_RELEASE_BUILD=1. Prefer verified CI artifact bytes; verify its SHA256SUMS before copying. Record provenance if a staging build is produced from an exact PR head instead.

Release layout proposal, to be checked against actual ownership:

- /var/www/dev.onlyempowerment.com/releases/<full-commit>/ : static dist contents only.
- /var/www/dev.onlyempowerment.com/current : symlink to reviewed release.
- /etc/nginx/sites-available/dev.onlyempowerment.com : isolated server block.
- Separate staging access/error logs under the existing logrotate policy, with retention accurately disclosed.

Nginx must only read the release. Do not serve the repository, node_modules, scripts, .git, .env, secrets, source/private documentation, or backup bundles. No PHP, Node service, database, or administrative interface is needed.

## DNS/TLS gate

Add only `dev` A → the verified VPS IPv4 address once the host is ready. No AAAA unless end-to-end IPv6 is verified. Prepare an HTTP server block using the existing ACME HTTP-01 snippet; nginx -t before reload. Issue a certificate using the existing Certbot account, webroot, and renewal conventions. Do not agree to new account terms or choose a new account implicitly. Enable HTTPS and HTTP-to-HTTPS redirect for dev only, retaining ACME renewal access.

## Response policy

- CSP: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'.
- Referrer-Policy: no-referrer.
- X-Content-Type-Options: nosniff.
- Permissions-Policy: camera=(), microphone=(), geolocation=().
- X-Robots-Tag: noindex, nofollow.
- HTML/build metadata revalidated; immutable hashed assets may have long cache lifetimes.
- Only serve required static paths; return 404 for unknown file paths and sensitive paths. Hash routing needs no catch-all rewrite.
- No cross-domain HSTS includeSubDomains change in this phase.

## Acceptance and rollback

Verify trusted TLS/SAN/expiry, HTTP redirect and www/apex preservation, browser navigation and preview, mobile layout, copy/print, source footer/build.json, CSP and headers, request capture, and 404 for .git/config, .env, package.json, private configs, and unknown paths. Compare deployed bytes with the reviewed artifact.

Reload Nginx only after validation. A successful reload command does not prove new workers are serving yet. Use a bounded readiness check with normal TLS validation on every probe before evaluating deployment failure; never bypass certificate checks. If verification fails, atomically restore the previous current symlink; for first deployment remove only the newly added enabled link and restore any explicitly backed-up config. Validate/reload and preserve diagnosis. Do not delete unrelated roots or records.

Run the existing VPS-wide backup and verify this root, Nginx config, and Certbot renewal material are covered. No new Restic repository, backup timer, rclone sync, or product backup workflow.
