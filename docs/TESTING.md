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
