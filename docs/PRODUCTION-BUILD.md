# Production build and static deployment

Batch A prepares repository artifacts only. It does not launch the site or change the VPS.

## Build modes

Use Node 24 and the committed lockfile. From a clean checkout of the accepted commit, the exact VPS shell production build command is:

```sh
npm ci
OE_RELEASE_BUILD=1 npm run build:production
```

This explicitly selects `OE_PRESENTATION=production`. `dist/build.json` reports version `1.0.0` and presentation `production`, while retaining truthful commit, tag and dirty metadata. `robots.txt` allows `/`; `index.html` and every `/read/*.html` omit `noindex` and `nofollow`. The 404 page deliberately remains non-indexable in both modes.

For development staging:

```sh
OE_RELEASE_BUILD=1 npm run build:staging
```

Plain `npm run build` defaults to staging when `OE_PRESENTATION` is unset. Staging reports presentation `staging`, keeps `Disallow: /` and `noindex, nofollow` on the homepage and every reading. The package version is `1.0.0` in both modes. Each build clears `dist`; preserve the production artifact before building staging. `OE_RELEASE_BUILD=1` refuses dirty source. An intentional release tag still uses the existing `OE_RELEASE_TAG=v1.0.0` validation; this work does not create a tag or a release.

## Release contents and stale-file removal

`404.html` and its small `404.css` are copied from `public/`, along with the local Source Serif 4 / Source Sans 3 fonts and favicon. No script or third-party asset is needed. Root-relative asset and recovery links work even for a deeply nested missing URL. `SHA256SUMS` covers every artifact file except itself.

The older `ops/deploy-*-candidate.py`, foundation and recovery scripts are historical, commit-pinned procedures, not current deployment entry points. Do not relax their pins or reuse them for this release. Use `ops/sync-release.py` to prepare the current artifact in an inactive candidate directory:

```sh
python3 ops/sync-release.py dist /var/www/onlyempowerment.com/releases/FULL_COMMIT-production
```

Replace `FULL_COMMIT` with the exact 40-character commit in `dist/build.json`. For staging use its separate site root and `FULL_COMMIT-staging`. The helper validates all hashes before writing, copies only manifest-listed files plus `SHA256SUMS`, and purges unlisted files and empty directories from that candidate, including `/rebuild-preview/`. It rejects traversal, duplicates, symlinks, dirty builds, wrong release names, and the site's current release. Do not serve a candidate while it is being prepared. A failed copy never activates it. Previous releases remain available for rollback.

Activation is a separately authorized operation: preserve the existing `current` target, verify the complete candidate against the independently accepted artifact, then atomically switch `current` to the candidate. Do not overlay files onto the served tree. The resulting served tree contains exactly the manifest plus the manifest itself. Do not use this helper on a deployment with a different root or activation layout without first adapting and reviewing it.

## Nginx response configuration

`ops/nginx-static.conf` is the current shared static-serving snippet. In the reviewed HTTPS block, replace the old static location rules with this snippet, preserving the site's root, certificate paths and security headers. Set `server_tokens off;` in the HTTP redirect block too. Keep the established ACME HTTP-01 snippet and TLS conventions. Do not install a second conflicting server block.

The snippet retains HTTP 404 when serving `/404.html`, blocks direct success responses from that error document, serves its local stylesheet/fonts, disables version disclosure, and enables gzip for JavaScript, CSS and SVG. Gzip is the portable compression choice; no optional Brotli module is required. If Brotli is already installed, it may remain enabled in the reviewed host configuration. Keep the existing CSP with `style-src 'self'` and `font-src 'self'`; the 404 needs no inline-style exception.

Production must remove any site-level or inherited `X-Robots-Tag` that blocks crawling. Staging must retain `X-Robots-Tag: noindex, nofollow, noarchive`. HTML metadata alone cannot override a blocking HTTP header. Do not change shared headers for neighboring sites.

Before a later authorized reload, run `nginx -t`. Verify the actual host returns the branded body and status 404 for nested unknown paths and `/404.html`; test homepage/readings, robots and response headers in each mode, gzip with `Accept-Encoding: gzip`, and absence of a version in `Server`. Confirm `/rebuild-preview/` returns 404 and cannot serve old content. Local Vite preview verifies page rendering but does not establish Nginx status behavior. Preserve and verify the existing VPS backup and rollback procedure before activation.
