# Testing standard

Test meaningful user behavior and trust boundaries. Coverage percentages are not a goal.

## Current automated checks

- Pure validation rejects empty and excessive responses with actionable errors.
- Plain-text output preserves entered text and states that a planned action is not completion.
- Source guard rejects current runtime network/persistence/evaluation/unsafe HTML APIs. It is a regression alarm, not a complete security proof.
- HTML CSP includes local-only scripts and no network/form answer submission.
- Browser tests visit all routes, run axe, and check viewport overflow; a 320px regression exercises reduced-motion mode and a maximum-length unbroken answer.
- Preview validation, focus, text escaping, backward edit, cancel/confirm clear.
- Synthetic private marker remains out of requests; no cookies/local/session storage; reload and route exit discard app state.
- Keyboard skip link, route heading focus, missing-route recovery.
- Clipboard failure has manual-copy guidance; print media hides chrome and preserves output.
- Build metadata and footer identify the same source.

Run across Chromium, mobile Chromium, Firefox, and WebKit. Mobile automation is an emulation check, not a real-device certification.

## Before each finished tool is accepted

Test explicit state transitions, optional questions, backward revision, empty/long/non-Latin inputs, invalid states, output mapping, completion vs planning, finite handoffs, cancellation, and unsaved exit behavior. Once persistence exists, test explicit opt-in, storage denial/quota/corruption/schema versions, truthful save state, selective deletion, full local deletion, and multi-tab behavior.

## Release gates beyond automation

Manual keyboard review, readable focus and zoom/reflow at 320px, 200% text and 400% browser zoom, real phone touch use, reduced motion/forced colors, screen-reader flow, copied text inspection, multi-page print/PDF inspection, CSP/header checks on actual host, public-source/build byte comparison, dependency review, and infrastructure log-retention verification.

Axe cannot certify WCAG compliance. Network tests exercise known paths and synthetic inputs; they do not prove absence of malicious behavior in every possible deployment. A screenshot is not proof that keyboard or screen-reader behavior works.

Use `docs/PHASE-1-STATUS.md` for executed results and remaining gates. Planned tests must not be reported as passes.

## Deployed staging verification

Use `npx playwright test --config playwright.staging.config.ts` to run against the fixed HTTPS staging URL. This does not start a local server or deploy anything. The foundation workflow also offers the manual `verify_staging` boolean input. Ordinary PR/main runs do not depend on VPS availability.

The staging config uses zero retries and checks the deployed foundation commit, headers, redirects, cookies, local/session storage, IndexedDB, caches, service workers, synthetic answer request capture, and laptop/mobile/print layouts. Its expected commit is deliberately pinned to the accepted Phase 1 deployment. Change that pin only as part of a reviewed future staging acceptance. Generated artifacts expire after seven days; the permanent acceptance record summarizes executed results and limitations.

For a later accepted staging artifact, set `OE_STAGING_COMMIT` to its independently verified full source SHA when running the staging suite. The default remains the original foundation checkpoint. Do not infer the expected SHA from the live site under test.

## Phase 2 reference suite

`tests/next-move.test.mjs` covers all field bounds, text preservation, artifact status, saved-schema validation, corruption/future records, quotas/denial/readback, stale edits, per-record/all-namespace deletion, unrelated data preservation, the 50-record bound, and finite future handoff selection. The runtime guard permits localStorage only in the artifact service and continues rejecting network/unsafe HTML/evaluation APIs.

`tests/browser/next-move.spec.ts` exercises the six-step workflow, all not-ready reasons, legitimate blockers, review errors and editing, internal-route Back, copy success and denied-copy selection, explicit saving and cancellation, reopen/edit/multiple records, deletion, corruption, denied/quota storage, cross-tab deletion, synthetic network markers, hostile content, long output, 320px reflow, forced colors, text enlargement, and print. The same suite is used against staging. Axe runs across workflow, error, pause, review, artifact, save/delete-dialog and saved-work states.

Screenshots and long-card PDF are emitted to test artifacts for actual visual review. Emulated viewport/text checks do not establish real mobile keyboard behavior or screen-reader conformance. Record executed evidence and remaining limitations in PHASE-2-ACCEPTANCE.md. True NVDA/VoiceOver/TalkBack testing remains a production gate unless independently performed.


## Phase 3 Decision Room candidate

Phase 3 adds decision-room unit and browser suites to the existing test structure. Both local and deployed configs run the same four projects and complete Next Move regressions. Configured retries are zero. Synthetic cases cover authored input, options, all lenses, pause branches, records, storage, handoff, network markers, axe, widths, text enlargement, forced colors and print. Manual screen-reader and real-device keyboard claims require actual evidence; automation alone is not certification.

## Phase 4 standards suite

`tests/standard.test.mjs` adds schema/bounds/authorship/source-governance/storage and three-type compatibility tests. `tests/browser/standard.spec.ts` adds the seven-stage workflow, all-section review editing, behavior-list bounds and focus, exact copy/fallback, print, explicit saving, mixed work, failed storage, cross-tab deletion/stale writes, unique markers in every field, hostile text, keyboard-only use, responsive widths, text enlargement, forced colors and axe. Both browser configs discover the new suite without reducing existing coverage; retries remain zero. Semantic snapshots are inspectable accessibility evidence, not actual assistive-technology testing. See PHASE-4-ACCEPTANCE.md for executed results and limitations.
