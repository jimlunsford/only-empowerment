# Phase 5 Reset candidate

Status: implementation in progress. Not ready for product review or merge.

Accepted base verified on 2026-09-22: `77d921d8bd2aecab94f9581c36262bf48a54d608`, version `0.1.0-dev.4`. Main CI run 35721414102 and deployed verification run 35725976278 completed successfully. Staging build metadata and the VPS immutable release identify this same clean, untagged commit. The connector cannot read administrative branch protection (403); the accepted required `verify` workflow and protected PR process remain authoritative and unchanged.

Scope: Reset, standalone Planned Reset Plan, explicit read-only Personal Standard selection, manual standard, legitimate standard-review pauses, four-artifact Saved Work, existing memory-first privacy and deletion semantics. Target development version: `0.1.0-dev.5`.

The feature PR must remain draft and unmerged. Exact candidate staging is authorized after verification. Accepted main remains rollback. Rebuild Map, Do It Now, production deployment, tags, releases, DNS, TLS issuance and indexing changes are excluded.

Evidence will be recorded here as verification completes. No unexecuted gate is claimed as passed.

## Implemented candidate and initial verification

Reset implementation is complete at development version `0.1.0-dev.5`; draft PR #7 remains unmerged. See RESET.md for doctrine, workflow, snapshot, status, storage and failure contracts. All accepted browser tests remain; the new suite adds Reset coverage rather than replacing them.

- 61 unit tests pass locally, including exact old-record compatibility, four-artifact quota/deletion and snapshot independence.
- Local Chromium and mobile Chromium Reset pass: 36 checks, zero retries, including the explicit source-review/reload integration check.
- `npm audit` reports zero vulnerabilities. No dependency additions or version changes; lockfile changes are application version metadata only.
- All 10 files from accepted-main CI artifact 10691738573 were independently downloaded and matched to current staging over trusted HTTPS. Staging remains accepted `77d921d` while Reset is developed.
- Initial test failures were fixture errors: assuming storage enumeration order and injecting records without refreshing same-tab application state. The assertions now compare bytes by key, and the injected fixture is discovered through normal navigation. No retries hide these failures.
- Visual refinement: the full read-only Personal Standard reference is expandable. Its statement and validity decision stay available without forcing the user through six reference sections. Explicit Reload selected standard handles a deliberate source update without a live dependency.
- Local Firefox cannot create a page in this container because its content process fails UID sandbox mapping. WebKit native dependency installation is unavailable in this container. Full pinned Firefox/WebKit verification remains a CI gate. Chromium was obtained from the official Chrome for Testing storage endpoint after the CDN returned invalid ZIP data.
- Actual NVDA, JAWS, VoiceOver and TalkBack testing has not been performed. Browser keyboard, semantic labels/focus, axe, forced colors, reduced motion, 200% text and 320px equivalent reflow tests are not WCAG certification.

## Deployment gate

VPS hostname and ordinary `jim` identity verified. Existing staging configuration hash remains `1af84bfffe4e3d4aafd4fc3b07147da1663b2f9c2d47b4e12534be7dbc5b683a`. The accepted-main deployment evidence records snapshot `b24ef8f10b4ef8467be31e3b1668de72bc38fa999d1eb8d2d2120817b21a2540`, 19 restored/hash-matched files, healthy neighbors and unchanged firewall/listening ports. This is baseline evidence, not a Reset backup claim.

The connected `jim` session requires sudo authentication. The verified Reset payload, independent CI comparison, pinned deployment helper and exact owner-run command must be prepared before requesting that step. No privilege or server-policy change is authorized. Reset deployment, full deployed browser suite, deployed visual review and post-deployment backup verification remain pending until the immutable candidate is switched on staging.
