# Batch 4 final polish

Base: `50386905b9781eed86ba82177e569e432a7217fb`.
Branch: `fix/batch4-final-polish`.

Item 12 includes the founder-authorized extension to the six PERIOD lesson navigation links. Items 13 through 15 retain their original implementation. Generated `/read/*.html` files are build output; their source generators and shared content are listed below.

| Item ID | Exact files modified | Status | Change |
|---|---|---|---|
| 12 | `index.html`; `src/main.tsx`; `src/Execution.tsx`; `src/PeriodLearning.tsx`; `tests/browser/execution.spec.ts`; `tests/browser/lesson-transitions.spec.ts`; `tests/browser/period-discipline.spec.ts`; `tests/browser/period-empowerment.spec.ts`; `tests/browser/period-integrity.spec.ts`; `tests/browser/period-practice.spec.ts`; `tests/browser/period-purpose.spec.ts`; `tests/browser/period-resilience.spec.ts`; `tests/browser/period.spec.ts`; `tests/browser/helpers/period-link-name.ts`; `tests/browser/batch4.spec.ts` | FIXED | Wordmark, workshop navigation and PERIOD lesson links derive accessible names from their visible text, including the visible lesson numbers, while retaining descriptions and navigation behavior. |
| 13 | `src/main.tsx`; `src/LegacyDataRemoval.tsx`; `scripts/privacy-reading.ts`; `tests/browser/legacy-retirement.spec.ts`; `tests/browser/navigation-public.spec.ts`; `tests/browser/work75-dialog-focus.spec.ts` | FIXED | Privacy reassurance leads both editions, legacy deletion moves lower, and distinct trigger/confirmation labels preserve Cancel-first focus and return to the opener. |
| 14 | `src/period-discipline-content.ts`; `tests/browser/period-discipline.spec.ts`; `tests/browser/period-purpose.spec.ts` | FIXED | Restored “Discipline.” and a concise action subtitle, with shared six-lesson typography, position labels and static reading parity verified. |
| 15 | `src/LoopPractice.tsx`; `src/loop-practice-content.ts`; `src/loop-state.ts`; `src/loop-view.ts`; `tests/browser/work72.spec.ts`; shared verification: `tests/batch3-preservation.mjs`; `tests/batch3.test.mjs`; `tests/batch4-preservation.mjs`; `tests/batch4.test.mjs`; `tests/fixtures/batch4-changes.json`; `tests/fixtures/batch4-reading.json`; `docs/batch4/verification.md` | FIXED | The existing memory-only history selects specific return teaching, while direct entry and both static editions retain complete explanations and every possible correction. |

## Verification details

- Wordmark uses word-break opportunities rather than a soft hyphen, including the script-independent root page.
- Workshop Back and Continue links use their visible two-line content as their accessible name.
- Lesson links retain the original destinations, current-page states, visible numbers, value names and descriptions. Names follow the visible desktop/mobile content; the original accessible descriptions remain available on both layouts.
- Axe runs the explicit `label-content-name-mismatch` rule, without exclusions, across every workshop screen, all six lessons, Rebuild sections, practice surfaces, Privacy and all generated static readings, in all four browser projects.
- Privacy continues to explain operational logs, hosting retention, old unencrypted records, deletion limits, consent and memory-only Standard Card state.
- Discipline uses the same heading, subtitle and position-label styles as the five other lessons. Its generated reading uses the same title and subtitle.
- Loop distinguishes task avoidance, an overbuilt plan followed by condemnation, hiding a miss, an identity verdict, and avoiding both needed sleep and responsibility. Previous choice, reset and reload do not preserve stale causes. The public miss entry does not invent a chosen path.
- Both Loop static editions include the complete generic fallback and all specific path explanations. No history is added to the URL or browser storage.
- Historical preservation tests reverse only checksum-pinned Batch 4 edits. Their original hashes remain intact, and new tests reject undeclared source changes.
- Existing browser assertions retain their behavior, focus, privacy and layout requirements. Navigation locators accept only the exact authored overview, desktop and mobile accessible names. No skips or retries were added.

## Results

- Unit tests: 176 passed, 0 failed, 0 skipped.
- Type checking and build: passed.
- Formatting: passed.
- Dependency audit: 0 vulnerabilities.
- Full local browser suite: 1,618 passed, 1 timed out, 29 existing conditional skips (1,648 cases; 55.4 minutes).
- The sole failure was the unchanged WebKit test at `tests/browser/work59.spec.ts:65`, which exceeded its 30-second test budget while checking six Rebuild stations. The same test passed unchanged in isolation with one worker in 26.1 seconds. No timeout, assertion or skip was changed. All 1,619 runnable cases therefore have passing local results, but the initial full run was not entirely green.
- All 20 Batch 4 browser cases passed in the full run, including the explicit axe rule across application and static reading routes in all four browser projects.
- GitHub Actions: required before merge; the associated pull request records the final result.

Local browser verification uses the pinned Playwright 1.64.1 Chromium, Firefox and WebKit builds on Linux with two workers. Missing WebKit system libraries were extracted into the local browser runtime; repository dependencies and workflow configuration were not changed.
