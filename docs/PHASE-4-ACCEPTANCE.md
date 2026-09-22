# Phase 4: Build a Standard candidate

Status: implementation complete; verification and staging acceptance in progress. Not accepted or merged. Deployment and product approval must not be inferred from this document.

## Source and boundaries

Accepted base inspected on 2026-09-22: `1a0909e9e3417c5eaf1f48cafc52da1be9a2d4ee`, version `0.1.0-dev.3`. Git remote main, trusted staging HTTPS metadata, and the VPS immutable current release agreed. Accepted main CI and deployed verification succeeded. No AGENTS.md was present.

Candidate branch: `feature/build-a-standard-v1`. [Draft PR #6](https://github.com/jimlunsford/only-empowerment/pull/6). Version: `0.1.0-dev.4`. No dependency additions or version changes. No production release/tag, merge, production application/DNS/TLS/indexing change, Reset, Rebuild Map, or Do It Now work is authorized in this phase.

The exact candidate SHA is the clean PR head identified by its successful CI run and generated build.json. Final local/CI/deployed hashes and operational results belong in the separate candidate report so that recording deployment evidence does not silently relabel deployed bytes.

## Product delivered

Seven deliberate stages lead to editable artifact review and explicit Set this standard confirmation. Personal Standard has nine authored sections and Status: Set. Set means deliberately chosen, never behavioral proof. Every section can be edited before and after confirmation. Saved edits require another explicit save.

The line remains the user's own. Goal versus standard, observable behavior, keeping and violating behaviors, protective structure, deliberate adaptation versus discomfort-driven negotiation, and immediate correction are taught without scoring, semantic rewriting, recommendations, punishment, or character judgment. Sources and governance are recorded in BUILD-A-STANDARD.md and standard-lessons.ts.

Saved Work accepts Personal Standards, Decision Records, and Execution Cards without migration. The shared 50-record bound, memory-only default, explicit save, oe:-scoped deletion, unsupported-record handling, storage readback, stale-write refusal, BroadcastChannel, storage-event fallback, and visibility checks remain in place. CSP and runtime privacy boundaries are unchanged.

## Executed checks before deployment

- Forty unit tests pass locally and in CI, including twelve new standard/schema/storage tests. Existing tests remain intact.
- TypeScript, formatting, ordinary build and clean strict release build have passed. npm audit reported zero vulnerabilities across all severity levels on 2026-09-22.
- First full CI run [35705872824](https://github.com/jimlunsford/only-empowerment/actions/runs/35705872824): 156 browser passes, four failures, twelve staging-only skips, zero retries. Three failures exposed a test helper checking for a replacement dialog before rendering; one exposed WebKit overflow at 320px with 200% text. The helper now awaits a visible outcome; standard content and header reflow were strengthened.
- Second full CI run [35707392523](https://github.com/jimlunsford/only-empowerment/actions/runs/35707392523): 162 passes, two failures, twelve staging-only skips, zero retries. All reopening cases and existing regressions passed. Added full-page diagnostic captures exceeded Firefox/WebKit's 32,767-pixel image limit before the enlarged-layout assertion. Those diagnostic captures now use the viewport while the assertion still measures the entire document. This run does not establish the final WebKit reflow result.
- Every standard-building stage passed 320, 360, 390, 1024 and 1440px width checks in the second run. All four projects exercised the same new workflow, authorship, list, storage, privacy, security, keyboard and axe checks. Final complete CI must pass again after the last changes.
- Reviewed desktop/mobile lesson screens, behavior lists, adaptation/negotiation, artifact and mixed Saved Work screenshots. Refined standard-specific wrapping, print container spacing, smaller secondary print attribution, meaningful example captures and durable accessibility snapshots.
- Rendered and visually reviewed all four pages of the long Chromium PDF. Every section and Status: Set are present; all 2,000 characters of the unbroken standard survive extraction. Navigation, staging banner and controls are absent. Final candidate print output must be reviewed again after the print refinements.

Local Playwright execution could not be completed: Chromium download responses were not browser archives; WebKit's fallback downloaded but required system libraries were unavailable and installation failed under the runtime's process restrictions. No failed browser launch is counted as an application test. The independent GitHub runner provides the pinned browser matrix.

## Test coverage and limits

The complete candidate matrix contains 176 cases: 164 applicable browser cases and twelve deployed-host-only cases skipped locally. The deployed config runs all 176 against fixed staging with an independently supplied full expected SHA. Chromium, mobile Chromium, Firefox and WebKit use zero configured retries. No existing Decision Room, Next Move, Saved Work, privacy or handoff test is removed.

New coverage exercises required/oversized/vague content, both list bounds and add/edit/remove focus, all review edits, Set semantics, exact copy and manual fallback, print, explicit saving/reopen/edit, three-type byte compatibility and quota, corruption/unsupported schemas, failed storage/readback, per-record and namespace deletion, stale edits, multi-tab behavior, markers in every authored field, hostile-looking text, keyboard flow, axe, forced colors, reduced motion and long-content reflow.

Accessibility target remains WCAG 2.2 AA. Executed keyboard automation, semantic snapshot inspection, axe and screenshots are not actual NVDA, VoiceOver, TalkBack or JAWS testing. Those assistive technologies and physical-phone testing were unavailable. A 320 CSS-pixel viewport tests the reflow width corresponding to 400% zoom from 1280px; actual browser-UI 400% zoom is not claimed. PDF inspection confirms readable output, not tagged accessible PDF.

## Required remaining deployment evidence

1. Successful complete CI at the exact clean final feature SHA, with visual/semantic/PDF review of its artifacts.
2. Independent CI artifact download and SHA-256 verification; exact comparison of all ten dist files against the local strict build.
3. Run the reviewed candidate helper on verified vps1.phoenix233.com using existing sudo authorization, immutable release and atomic current switch. Keep accepted main as rollback.
4. Trusted HTTPS equality for every deployed file, clean build.json, footer source identity, TLS, noindex and restrictive CSP.
5. Full deployed suite, zero retries, and real staging interaction/visual review.
6. Existing VPS-wide pre/post backups, restore/hash verification of release plus material configuration, nginx -t, active service/timers, healthy neighboring sites and unchanged firewall/listening ports.
7. Detailed candidate report and Jim's explicit product review. PR stays draft and unmerged; production remains untouched.

No pending gate above is represented as passed. Historical acceptance documents are unchanged.
