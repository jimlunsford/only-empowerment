# Batch 3 content reconciliation

Base: `75d30695455ac512a3862bd43e7d674476b089b7` (verified main at task start).

Branch: `fix/batch3-content-reconciliation`.

The source changes are limited to Items 9 through 11. Static reading pages are generated from the same authored content and generators; `dist/read/*.html` is build output, not committed source. Shared verification adapters and fixtures are listed once under Item 11. Item 11 also uses the Rebuild source files listed under Item 10. The workshop source also carries Item 11’s transfer extension.

| Item ID | Exact files modified | Status | Change |
|---|---|---|---|
| 9 | `src/execution-workshop-content.ts` | FIXED | Reworked the Stage 4 alternatives and answer positions, disclosed assumed organizer contact, removed setup giveaways, and retained shared reading output. |
| 10 | `docs/work53-source/all.html`<br>`docs/work53-source/help.html`<br>`docs/work53-source/index.html`<br>`docs/work53-source/negotiation.html`<br>`docs/work53-source/return.html`<br>`scripts/standalone-reading.ts`<br>`src/rebuild-content.ts`<br>`src/loop-content.ts`<br>`src/loop-view.ts`<br>`tests/rebuild-integration.test.mjs`<br>`tests/browser/loop.spec.ts`<br>`tests/browser/work62-education.spec.ts` | FIXED | Mapped Rebuild movements to the corresponding Loop teaching, added overlap links, removed the contradiction, and kept Rae’s contact consistent with her trusted friend. |
| 11 | `docs/work53-source/end.html`<br>`scripts/discipline-reading.ts`<br>`scripts/empowerment-reading.ts`<br>`scripts/execution-reading.ts`<br>`scripts/integrity-reading.ts`<br>`src/Discipline.tsx`<br>`src/Empowerment.tsx`<br>`src/Integrity.tsx`<br>`src/Purpose.tsx`<br>`src/execution-content.ts`<br>`src/execution-view.ts`<br>`src/execution.css`<br>`src/period-discipline-content.ts`<br>`src/period-empowerment-content.ts`<br>`src/period-integrity-content.ts`<br>`src/period-practice-content.ts`<br>`src/period-purpose-content.ts`<br>`src/period-resilience-content.ts`<br>`src/site-footer.css`<br>`tests/batch1.test.mjs`<br>`tests/batch2-preservation.mjs`<br>`tests/batch2.test.mjs`<br>`tests/browser/period-discipline.spec.ts`<br>`tests/browser/period-integrity.spec.ts`<br>`tests/editorial-copy-helpers.mjs`<br>`tests/period-discipline.test.mjs`<br>`tests/work35-editorial.test.mjs`<br>`tests/work56-preservation.mjs`<br>`tests/work72-corrections.test.mjs`<br>`tests/work73.test.mjs`<br>`tests/work80.test.mjs`<br>`vite.config.ts`<br>`src/reading.css`<br>`tests/batch3-preservation.mjs`<br>`tests/batch3.test.mjs`<br>`tests/browser/batch3.spec.ts`<br>`tests/fixtures/batch3-changes.json`<br>`tests/fixtures/batch3-copy.json`<br>`tests/fixtures/batch3-reading.json`<br>`docs/batch3/verification.md` | FIXED | Added evening-course transfer, reduced caveat repetition, clarified voice and Ownership/Empowerment, and polished reading headings and printed closing credits. |

## Requirement verification

- **9a:** Three plausible action choices on each event screen; the strongest choices occupy positions 2, 3 and 1. Explanations distinguish timing, authority, agreement and confirmed completion.
- **9b:** Event-close explicitly assumes organizer contact even after “Wait for access before involving the organizer,” and says that the earlier choice did not perform that work.
- **9c:** The changed handoff uses concrete facts about the shared pavement and recipient availability. The blocked case describes an unstable load above shoulder height. Neither setup supplies the verdict immediately above its violation.
- **9d:** The reading transcript uses the same workshop screen and option objects, including every consequence and explanation.
- **10a:** Steps 1, 2, 3 and 8 retain their relevant Rebuild lessons. Steps 4 through 7 link respectively to Loop parts 2, 3, 4 and 5, with an explicit explanation of the overlap.
- **10b:** Removed the “not a second rebuilding sequence” claim. Rebuild and Loop explain their uses of negotiation and return after a miss, with direct cross-links. Rebuild also links to the relevant Execution teaching.
- **10c:** Rae’s sister contacts the trusted friend with Rae’s permission. The friend and Rae agree on accessible contact, preserving Rae’s preferences, ongoing counseling and the unconditional availability of needed care.
- **10d:** The complete Rebuild and Loop reading editions contain the revised text and direct static section links.
- **11a:** Stage 4’s “Bring it back to your day” now includes an evening-course transfer alongside the repair-after-a-miss teaching. It distinguishes completed practice from course completion and retains illness, access and support limits.
- **11b:** Repeated fiction, submission and editorial-acceptance boilerplate was consolidated or removed. Every generated reading page has at most one fiction-framing line, including Discipline and Rebuild. Clinical limits, consent, responsibility versus blame, ongoing support and honest Standard Card status remain intact.
- **11c:** Execution’s origin passage consistently uses first person. Rebuild’s “Draw the line” was already consistently first person at the supplied main commit and was preserved. The exported-copy example now explicitly identifies asking for help as Ownership and offering useful skill to another person as Empowerment.
- **11d:** Every generated reading stylesheet includes shared screen heading margins. Print CSS reduces closing and credit spacing, retains the complete attribution, and keeps the closing Execution reminder together.

## Validation

- Unit tests: **172 passed, 0 failed**.
- Type checking and build: **passed**.
- Formatting: **passed**.
- Dependency audit: **0 vulnerabilities**.
- All 16 focused Batch 3 browser checks passed across desktop Chromium, mobile Chromium, Firefox and WebKit.
- Full browser suite: **1,485 passed, 114 failed, 29 existing skips** on the first parallel run (1,628 cases total). Of the failures, 113 reported browser crashes, closed pages/contexts or capture errors; one reported a WebKit cold-font anchor outside the viewport.
- After the final duplicate-label cleanup, all **114 failed cases passed** with one worker and unchanged assertions. Thus all **1,599 runnable suite cases have passing results**; no skips were added.
- Final focused reading/print checks after the label cleanup: **32 passed, 0 failed** across all four browser projects.
- Additional WebKit cold-font repetition: **8 passed, 1 failed**. The failure is the unchanged `work62-education.spec.ts:33` viewport assertion after fonts load, at the trust example.
- Controlled untouched-main comparison at `75d30695455ac512a3862bd43e7d674476b089b7`, same WebKit build and one worker: an initial **9 passed**, followed by **26 passed, 4 failed** over 30 repeated cases. The same viewport assertion failed at structure, return and trust. This establishes that the intermittent cold-font issue exists on the supplied baseline.
- **Remaining limitation:** repeated WebKit cold-font navigation is not consistently green. No assertion or skip was changed, and no out-of-scope Batch 2 font/navigation correction was added. Passing serial suite results must not be read as proof that this pre-existing intermittency is resolved.

Local browser execution uses Chromium 158.0.8127.0 from the available browser runtime because the repository-pinned Chromium download was blocked. Firefox 157.0 and WebKit 27.2 use the repository’s installed builds. WebKit’s missing shared libraries were extracted into temporary test directories and supplied by a local launcher; repository dependencies and CI configuration are unchanged. The serial Chromium launcher uses in-process GPU and SwiftShader graphics flags; assertions, timeouts and retry settings are unchanged. Browser artifacts were moved out of temporary memory-backed storage before the serial run. These are local results, not a claim that the pinned CI browser suite has run.

The initial Chromium capture error was also reproduced on untouched main for the homepage screenshot test. No assertion, screenshot requirement or test skip was relaxed to accommodate it.

## Print evidence

A4 and Letter exports with 14 mm margins and backgrounds enabled were inspected with Chromium 158 and PyMuPDF. Every final page contains teaching content and the full copyright/source credit, with no credit-only trailing page.

| Reading | A4 pages | Words on final A4 page | Letter pages | Words on final Letter page |
|---|---:|---:|---:|---:|
| Purpose | 9 | 238 | 10 | 184 |
| Rebuild | 11 | 358 | 12 | 172 |
| Execution | 23 | 165 | 24 | 379 |

No push, pull request, merge or deployment is part of this local candidate.
