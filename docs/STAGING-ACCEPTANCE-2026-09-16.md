# Only Empowerment Phase 1 staging acceptance

Date: 2026-09-16. Staging operational acceptance completed with the explicit review limitations below. No production launch, release tag, application feature change, or Phase 2 implementation.

Staging: https://dev.onlyempowerment.com/

Repository: https://github.com/jimlunsford/only-empowerment

Operational closure: https://github.com/jimlunsford/only-empowerment/pull/2

## Source state

Accepted application source and main at the start of deployment: `701664c1b4af37287f4b16fcf8a76a41d09f00c7`. It exactly matched the kickoff checkpoint. Version `0.1.0-dev.1`; tag null; dirty false. Main CI run [35076785285](https://github.com/jimlunsford/only-empowerment/actions/runs/35076785285) passed four unit/privacy checks and 28 browser scenarios.

The repository is public. Licensing remains UNLICENSED. Private vulnerability reporting is enabled. PR #2 adds operational scripts, verification and documentation only. The deployed source remains the accepted foundation commit even after later operational records are merged. No app source, runtime dependency, package version or application behavior was changed by closure.

## Starting infrastructure and DNS

Remote Desktop Commander identified `vps1.phoenix233.com` and user `jim`. Noninteractive sudo required a password. The owner ran the reviewed scoped scripts in the VPS terminal. No password was transmitted through chat, no sudoers change was made, and no new management identity or credential was created.

Authoritative NS: ns1.wordpress.com, ns2.wordpress.com, ns3.wordpress.com. The domain was active. The complete WordPress zone before deployment had:

| Record | Value | TTL |
| --- | --- | --- |
| Apex A | 104.36.229.165 | 300 |
| www CNAME | onlyempowerment.com. | 14400 |
| _domainconnect TXT | public-api.wordpress.com/rest/v1.3/domain-connect | 3600 |
| NS | WordPress-managed protected record | Provider managed |

No apex AAAA, MX or CAA records, or dev record, were present. The complete zone inspection found no other mail/subdomain record to change. This is not an assertion that the domain can never have implicit or external mail dependencies.

Before deployment, apex/www HTTP returned Nginx 404 and HTTPS failed hostname validation. There was no Only Empowerment webroot, enabled Nginx host or certificate lineage. Existing shared ACME and VPS-wide backup infrastructure was present and active.

The connector's DNS write capability was disabled. The owner added exactly `dev` A `104.36.229.165`, TTL 300. The final complete zone was re-read and all other records were unchanged. All three authoritative nameservers plus 1.1.1.1 and 8.8.8.8 passed the script's DNS checks. No AAAA, nameserver, apex, mail or unrelated TXT change occurred.

## Deployment and source identity

Release directory:

`/var/www/dev.onlyempowerment.com/releases/701664c1b4af37287f4b16fcf8a76a41d09f00c7/`

Current pointer:

`/var/www/dev.onlyempowerment.com/current`

The pointer resolves to that release. Release files are root-owned and read-only; Nginx only reads the static output. No Node service, PHP handler, proxy, database, account system or permanent application runtime was installed. Operational support files are outside the served current directory and HTTP access to private/source paths returns 404.

A clean local strict build (`OE_RELEASE_BUILD=1`) reproduced all seven file hashes in the independently downloaded main CI artifact. Artifact ID `10437803928`, ZIP digest `43299069a5cb0ecbcce31592bc476758a8a6a3efe4726370b26bac1cb3493a70`. The prepared envelope contains those seven files plus SHA256SUMS; envelope SHA-256 `14ebc75cd71c62788a6407ef13eac4616707ac76d47f2fc98fc53456cd72684b`.

The seven deployed file bodies, fetched over trusted HTTPS, matched:

| File | SHA-256 |
| --- | --- |
| THIRD_PARTY_NOTICES.txt | 0b455894e8f03d9906f750b8250ac02cfcfd09f08a9e890ff164cb84a2772801 |
| assets/index-DjxWIcLg.js | 888c39d264922924490b642bd9b555b36fc4ee4ee953b72d08adffc38fef0742 |
| assets/index-Gs19Boei.css | 6ac4af203e4fd8b711fa7c703a812402e5bdbb9b4080d8a6586cbf1513ac1a4a |
| build.json | 4602980a5ca36647f192b22761938c1f59725188948f7c2e3f5aaa2578ac21db |
| favicon.svg | 97802cbeb81f33e94d2d863db6705dada36c624c13d8ed889d16285950544382 |
| index.html | 99fda0cae7ca1a985e2a0eb0256bd54dac1f91c49d08797acf58aa9b6c38b020 |
| robots.txt | 331ea9090db0c9f6f597bd9840fd5b171830f6e0b3ba1cb24dfa91f0c95aedc1 |

The visible footer and `/build.json` identify version `0.1.0-dev.1`, full source commit above, dirty false, and its public GitHub commit URL. Metadata was independently fetched from the Windows workstation and checked in the live browser matrix. No generated app files were manually edited after building. Byte comparison is evidence for this deployment, not a guarantee against every future host compromise.

## Nginx, TLS and recovery

Site configuration: `/etc/nginx/sites-available/dev.onlyempowerment.com`, with its enabled symlink. Root is the current release. Hash routing needs no server catch-all; unknown paths return 404. Directory listing is disabled. HTML/build metadata use no-cache; hashed JS/CSS use max-age 31536000. JS and JSON MIME types were verified.

Headers were verified on actual responses:

- CSP: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'.
- X-Content-Type-Options: nosniff.
- X-Frame-Options: DENY.
- Referrer-Policy: no-referrer.
- Permissions-Policy: camera=(), microphone=(), geolocation=().
- X-Robots-Tag: noindex, nofollow, noarchive.

Noindex also appears on asset and metadata responses. It is an indexing instruction, not access control. Robots.txt and HTML meta remain the original noindex/disallow foundation files.

Certificate lineage: `dev.onlyempowerment.com`. Only SAN: `DNS:dev.onlyempowerment.com`. Issuer: Let's Encrypt YE1. Valid September 16, 2026 09:52:15 GMT through December 15, 2026 09:52:14 GMT.

Served leaf SHA-256 fingerprint:

`6E:CC:BB:38:64:6A:16:D3:C4:70:D4:71:7B:34:4D:B3:82:20:17:3D:38:F1:AB:3A:A4:CE:E4:43:DC:58:B8:AE`

OpenSSL hostname/chain validation passed. The served SNI certificate matched that fingerprint. Curl verification passed from both VPS and Windows. HTTP redirects to staging HTTPS with 301; the existing HTTP-01 path remains exempt and an absent test token returned 404 without redirect. Existing webroot `/var/www/letsencrypt` and existing Certbot account/hook were reused. No duplicate lineage or production certificate was issued.

The first deployment's immediate post-reload HTTPS check encountered the old certificate and rolled back the new host. The issued certificate and files were retained. Recovery pinned the retained configuration/helper, validated certificate trust before activation, and used bounded strict-TLS probes. Its first probe returned curl 60 and second passed. This demonstrates the need to wait for new Nginx workers after reload. No certificate bypass was used. Nginx validation preceded each reload.

Lineage-specific `certbot renew --cert-name dev.onlyempowerment.com --dry-run --run-deploy-hooks --non-interactive --no-random-sleep-on-renew` passed using the established shared validated-reload hook.

## Privacy and browser acceptance

[Live verification run 35088285035](https://github.com/jimlunsford/only-empowerment/actions/runs/35088285035), test source `38e6beaf88fd2d59b21e63e23a1815990279c84f`, passed all 40 deployed scenarios with zero configured retries. Browsers: Chromium, mobile Chromium (Pixel 7 emulation), Firefox, WebKit. The run also passed four unit checks, TypeScript/build/format gates and 28 local browser cases. Its 12 staging-only cases were intentionally skipped in the local run.

Observed lifecycle requests consisted of first-party HTML, JS, CSS and, in Firefox, favicon GETs. No POST, answer payload, synthetic marker in captured URLs/bodies, analytics, AI, remote font, third-party script or form-processor request appeared. Fresh test contexts had zero cookies, localStorage entries, sessionStorage entries, IndexedDB databases, Cache Storage entries and service-worker registrations. Clear, cancelled clear, confirmed clear, edit, reload and route-exit behavior passed. The application required no account.

Ordinary asset requests expose IP and request metadata to the host. Separate Nginx access/error logs use the existing daily/14-rotation policy with compression and notifempty. This is not a guaranteed 14-day erasure promise. Provider-level retention and all backup exclusions were not independently re-audited; no stronger claim is published. External links lead to JimLunsford.com or GitHub only by user action, with no answer in their URLs and no-referrer policy. Clipboard/print/browser/OS/extension copies remain outside app deletion control.

All shell routes and six tool outlines were exercised with axe and overflow checks. Manual cloud-browser review covered homepage, preview, validation focus, successful copy, keyboard skip and route focus, approach and privacy copy, builder and source links. Laptop 1024px, mobile 390px, 320px card and desktop screenshots were visually reviewed. Narrow-width and 600-character unbroken-answer reflow passed. Reduced-motion mode was exercised. No completed tool is implied by the outlines or sample card.

Clipboard copying succeeded after the explicit button click and contained the expected synthetic card. Mocked permission failure showed manual-copy guidance in all browser projects. No automatic clipboard-write behavior was introduced. The explicit print control was exercised; print media hides navigation, staging banner and buttons while preserving the card. A Chromium-generated A4 PDF was rendered and inspected: one page, readable text, no clipping, and builder attribution present.

Limitations: the preview PDF is not tagged for assistive technology and retains a blank shaded page-background region when background printing is enabled. These are documented print/accessibility polish gates for the real reference tool, not evidence of completed accessible PDF output. The browser-native printer dialog, physical printing, manual screen readers, real-device touch behavior, forced-colors mode, and exact native 200% text/400% zoom were not certified. Automated axe passes and 320px reflow do not establish full WCAG conformance. Target remains WCAG 2.2 AA.

## GitHub governance

Main protection was enabled and re-read successfully:

- PR required for ordinary updates, including admins.
- Required check: `verify`, bound to GitHub Actions app ID 15368.
- Strict up-to-date branch requirement.
- Zero additional approving reviews avoids solo-maintainer deadlock.
- Force pushes and branch deletion disabled.
- No merge queue, signed-commit, deployment-status or new credential requirement.

The owner retains administrative settings access for deliberate emergency recovery. No automatic privileged bypass was created. Standard PR/main CI remains independent of staging availability. The optional manual `verify_staging` input tests the fixed staging host without deploying or requiring secrets. No deployment automation was added.

## Backup and neighboring services

Existing VPS-wide backup service ran successfully before the original attempt, before recovery, and after completed recovery/renewal. No new repository, timer or rclone synchronization workflow was created.

Verified final snapshot:

`d2e0fd14e49555a13105176192a10accf81ec3f56e2f8b0cc52f240a8a409928`

Snapshot time: `2026-09-16T10:56:13.4790861Z`.

Nineteen files were restored to memory and SHA-256 matched to live files:

- Eight release files, including SHA256SUMS.
- Staging Nginx config and existing shared ACME snippet.
- Staging Certbot renewal config and existing validated-reload deploy hook.
- Four certificate archive files: certificate, chain, fullchain and private key. No secret bytes were printed or published.
- Original deployment helper, recovery helper, and pre-backup deployment evidence under the unserved private directory.

This verifies file content coverage, not a full disaster-recovery boot test. The current and enabled symlinks were inspected live; their restoration was not independently exercised in this execution.

Nginx remained active and validated. JimLunsford.com, JimLunsford.net, Bonumark.org, Phoenix233.com, ltdcsserver.com and jiml.net returned 200 before and after recovery. UFW output and listening-address/port sets matched before and after: public 22/80/443; local database/DNS listeners unchanged. No new port was opened.

Apex/www Only Empowerment remain HTTP 404 and hostname-invalid HTTPS, exactly as inspected initially. No production redirect, certificate fix, application deployment or release tag occurred.

## Licensing proposal and remaining work

[LICENSING-PROPOSAL.md](LICENSING-PROPOSAL.md) contains the exact proposed package/lockfile identifiers, README, copyright notice, in-app notice, contributor wording, third-party treatment and full AGPL reference text. It is unapproved and unapplied. No LICENSE was added at repository root or to the deployed build; package licensing remains UNLICENSED.

Approve or decline AGPL-3.0-or-later explicitly before adoption. Full linked framework articles remain outside the grant; trademarks and endorsement are separate; included original application code, documentation and concise lesson adaptations are the proposed covered scope.

Phase 1 operational staging gates are satisfied within the explicit review limits. Remaining governance decision: software licensing. Real-tool accessibility/output release gates above remain for future implementation. Next Move is still the recommended first reference tool. Phase 2 has not begun.
