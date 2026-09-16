# Phase 1 checkpoint

Date: 2026-09-16. Foundation implemented and staging verified; no production launch and no Phase 2 work. See [operational acceptance](STAGING-ACCEPTANCE-2026-09-16.md) for current deployment evidence. The starting-state section below is historical.

## Starting state

GitHub connector and authenticated GitHub CLI reported the preferred repository absent. The CLI identity was jimlunsford. A public repository was created before application implementation, with initial main commit `6b56dde9ca2bf84cfca92912953eaff7d0ad4675`. Foundation work is on `foundation/phase-1`.

Public DNS was inspected from the connected workstation, including direct queries to ns1.wordpress.com:

| Item | Observed state |
| --- | --- |
| Nameservers | ns1.wordpress.com, ns2.wordpress.com, ns3.wordpress.com |
| Apex A | 104.36.229.165, TTL 300 |
| Apex AAAA | No answer; authoritative SOA returned |
| www | CNAME onlyempowerment.com |
| dev | NXDOMAIN |
| Apex MX/TXT | No answers; authoritative SOA returned |
| _dmarc TXT | NXDOMAIN |
| CAA | No CAA data returned by Node DNS query; Windows named-type query unsupported |
| HTTP apex and www | 404, nginx/1.24.0 (Ubuntu), no redirect observed |
| HTTPS apex and www | Certificate hostname validation fails; no bypass performed |

Absence of MX does not prove no mail use (implicit A-record delivery and undiscovered subdomains remain possible). DNS and mail settings were preserved. Current host is consistent with the VPS address and Nginx response, not Shopify.

The VPS connected as jim and hostname verified vps1.phoenix233.com. No matching Only Empowerment root was found under /var/www; no matching enabled Nginx block or Certbot renewal lineage was listed. Some protected configuration cannot be fully inspected without elevation. `sudo -n true` required a password. Two later read-only Commander calls timed out and the device subsequently showed offline, so inspection must resume before deployment.

The existing vps-backup.service last completed at 2026-09-16 06:38:13 UTC with exit status 0. Both existing backup/maintenance timers were present. This proves successful service execution, not a restore test or verified new-site snapshot. No VPS configuration, public content, DNS, mail, or TLS was changed.

## Implementation

Preact/TypeScript/Vite shell; home, catalog, six outlines, approach, privacy, missing-route handling, and an in-memory interaction preview. Short lesson, associated validation error, editable sample card, explicit clear/cancel, copy with failure guidance, and dedicated print CSS. No complete reference tool and no persistence.

Version/source metadata includes full commit, tag, dirty flag, source URL, plus file checksums. Strict deployable builds reject a dirty checkout. The footer labels local changes honestly.

## Verification status

The accepted foundation at `701664c1b4af37287f4b16fcf8a76a41d09f00c7` passed four unit/privacy checks and 28 browser scenarios in [main CI run 35076785285](https://github.com/jimlunsford/only-empowerment/actions/runs/35076785285). Operational test source `38e6beaf88fd2d59b21e63e23a1815990279c84f` then passed all 40 deployed-staging scenarios in [run 35088285035](https://github.com/jimlunsford/only-empowerment/actions/runs/35088285035), across Chromium, mobile Chromium, Firefox and WebKit. No retries were configured for the deployed run. Its local verification also passed four unit checks and 28 browser cases; 12 staging-only cases were intentionally skipped locally.

Live desktop, laptop/mobile/narrow screenshots, keyboard focus, successful clipboard copying, privacy disclosures, and the one-page browser-generated PDF were reviewed. Manual screen-reader, real-device, native 200% text/400% zoom and physical-printer checks remain release gates, not claimed passes. The PDF is untagged and contains a blank page-background region when background printing is enabled, a preview polish limitation.

Earlier CI found and prompted fixes for footer target spacing, a missing development-status landmark, ambiguous test selectors, and a rapid navigation privacy race. The passing run verifies the corrections. npm audit reported zero known vulnerabilities in the current lockfile on 2026-09-16. Strict-build rejection of dirty source and correct clean commit metadata were directly verified. These checks do not constitute manual screen-reader or real-device certification.

## Operational closure and remaining decision

Staging is live at https://dev.onlyempowerment.com/ with accepted source `701664c1b4af37287f4b16fcf8a76a41d09f00c7`, version `0.1.0-dev.1`. DNS, trusted TLS, lineage-specific renewal dry run, noindex/security headers, source metadata, seven file hash comparisons, live privacy behavior, and neighboring site health were verified. The existing VPS-wide snapshot `d2e0fd14e49555a13105176192a10accf81ec3f56e2f8b0cc52f240a8a409928` restored 19 site/config/TLS/support files to memory with matching SHA-256 hashes.

Main protection requires PRs and the real GitHub Actions `verify` check, strict up-to-date branches, no force push or deletion, including admins. Owner settings remain available for deliberate emergency recovery. Private vulnerability reporting remains enabled.

Licensing is pending explicit owner approval. [The exact AGPL proposal](LICENSING-PROPOSAL.md) and full reference text are prepared; no grant has been applied. Product-level manual accessibility and print refinement gates remain as documented. Production is unchanged.

## Definition-of-done index

| Question | Answer location |
| --- | --- |
| What, who, refusals | PRODUCT-DOCTRINE.md |
| Four frameworks | FRAMEWORK-MAP.md |
| Six responsibilities | TOOL-CATALOG.md |
| Teaching and shared workflow | WORKFLOW-MODEL.md |
| Storage, network, deletion | PRIVACY-ARCHITECTURE.md |
| Architecture and rationale | decisions/0001-APPLICATION-ARCHITECTURE.md |
| Testing | TESTING.md |
| Staging | STAGING-RUNBOOK.md |
| Production and live-source traceability | RELEASE-STANDARD.md |
| Accessibility | UX-AND-ACCESSIBILITY.md |
| v1 inclusions/exclusions and first tool | V1-SCOPE.md |

Next Move is recommended for Phase 2. Phase 2 has not begun.
