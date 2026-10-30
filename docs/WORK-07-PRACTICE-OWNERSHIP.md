# Work 07: Practice Ownership

This internal candidate implements Work 06 v1.1 under Product Vision v0.18. It starts at the verified Work 05 commit `43ba8627ad1881072bd3290b3adccd7228cd6fb6`, on `work/07-practice-ownership`, for a draft PR targeting `work/05-editorial-companion`. Teaching approval covers implementation and founder evaluation. Public publication, merge, and deployment require separate authorization.

## Source and repository checks

The following complete sources were read before editing:

- Product Vision v0.18, Google Doc `1W1J6OAoM-YjVP8d2TIrstWhm3UOWQyEnfCB13fDPp1Y`.
- Exact approved `Only-Empowerment-Work-06-Practice-Ownership-v1.1.docx`, Library ID `libfile_0c3d62364280819195af8579ab467e80`. Downloaded DOCX SHA256: `7283a6b52e94a005d2dfaf5cc0e540a1f53d71cbe0308b2b581c5284269e36e0`. All 14 embedded composition images were inspected.
- Authoritative Project Source `book_1.docx.md`, 2,998 lines and 27,972 words. SHA256: `974ebbbb57d5b5f72f6258af6afa0ff02eab36e6dba3c8ad0639a2a430a72dfe`.
- Work 04 Editorial Companion design, Google Doc `1z3JAVYA6K4C5tWnZSRj9wb_niWzFbbErVDusqwcLun0`.
- Work 05 PR #17, repository standards, existing behavior, and staging build identity.

Before work, main was `ac4d72519fcce83aaf75c75ec06bbfc34fcd0700`. PR #16 was draft/open at `f2f3ef3171ce2c3937a89f989df35b3dc12b7a7a`, targeting main. PR #17 was draft/open at the Work 05 baseline, targeting `work/02-period-experience`. Work 05 Product verification run `40952022054` was successful. Staging reported the exact Work 05 baseline, clean source, staging presentation, and version `1.0.0-rc.3`.

The source manuscripts, design DOCX, and private Google documents are not included in the repository or review artifact. No existing branch, PR, main, or host is changed by this candidate.

## Behavior and privacy

| Route | Behavior |
| --- | --- |
| `/#/period/practice` | Change whether messaging worked. The scenario, available responsibility, and current-condition label change together. |
| `/#/period/practice/responses` | Reflection prompt precedes the comparisons. Honest update starts open. Waiting, overpromising, and asking for help are independent native disclosures. Messages and explanations follow the communication condition. |
| `/#/period/practice/follow-through` | Explicitly continues the honest-update worked example. Three fictional records separate intention, demonstrated behavior, and a later repair. Household disclosure preserves shared agreement and real capacity. |
| `/#/period/practice/connected-code` | All six contributions and relationships remain visible. The Code is a continuing standard for living. The invitation to act privately outside the app precedes the optional card and contextual book resource. |

App-owned fictional state has only `communication` and `evidence`. It survives in-site navigation and resets on reload. No response is selected or recorded. No personal fields, scores, badges, completion state, analytics, storage writes, new dependency, account, server, or schema is introduced.

`PracticeOwnership` receives only the fictional state and a parameterless card-entry callback. It cannot inspect the card draft. The shell uses the existing `enterPeriodExercise` rule: preselect Ownership only when the entire draft is empty. A selected value alone, whitespace, any authored field, or the card-result view is preserved. The original edit, copy, denied-clipboard fallback, print, validation, and cancellable clearing remain in the existing component.

The build-time linear fallback includes both communication conditions, both honest/help message openings, every comparison explanation, all three evidence records, repair, the household example, all six relationships, and the outside-app action invitation. It contains no practice controls or required disclosures. Both disabled JavaScript and failed app-script loading are exercised.

## Approved copy and composition comparison

The complete approved teaching script is in `period-practice-content.ts` and shared with the fixed fallback. Introduction, lesson invitation, card lead, selector question/hint, card scope note, and contextual book wording implement the v1.1 integration changes. The original Why PERIOD?, founder origin, Ownership lesson, and Purpose bridge are preserved.

Four functional clarifications turn the design's explanatory instructions into visible text: the fictional section/check-in assumptions; the named worked example regardless of comparisons opened; the need for agreement to a revised household plan; and receiving help versus empowering someone. These are faithful adaptations of the v1.1 directions, not manuscript quotations. The sidebar also labels the order as teaching, not completion. The exact approved card scope paragraph is shared by the result, copied text, manual fallback, and print.

| Approved composition | Implementation and material differences |
| --- | --- |
| Situation desktop/mobile and unavailable alternate | Same warm paper, Source Serif 4/Source Sans 3, evergreen selection, clay reflection, desktop sidebar and main column, mobile heading/local navigation then compact six-value order. Both facts are real pressed buttons. The visible current-condition and fiction labels add height. |
| Response comparison | Same independent disclosures and sage honest-message panel. Reflection is above the comparisons; the explanation follows the message in ordinary body text. Explicit fictional timing assumptions add a short paragraph. No gate or personal response is required. |
| Follow-through and missed-update alternate | Same timeline, three state controls, evidence surface, correction, and household disclosure. Explicit worked-example and assumption text adds height. The shared-agreement clarification follows the household explanation. |
| Connected Code desktop/mobile | Six semantic list rows carry both contribution and connection. At narrower widths the name sits above its explanation. The ongoing-Code statement remains prominent. Receiving-help clarification adds a paragraph. The book remains below useful teaching. |
| Optional card | Existing editor/result composition and exact authored strings retained. On mobile, vertical spacing above the first input is reduced to accommodate the longer approved lead while retaining the complete privacy notice and readable type. No field is removed or made mandatory. |
| All views | Real review/build notices and the existing footer remain. A direct Optional Standard Card footer link preserves discoverability after the primary learning invitation changes. Natural wrapping, native disclosure markers, and added functional clarifications make page heights differ from fixed composition boards. |

No new visual system, stock imagery, decorative component package, animation, or five additional lessons is introduced. At 390px the teaching order is two columns in authored row order; below 360px it is one column. Only Ownership links to a lesson.

## Verification and evidence

The accompanying review report records the exact final commit, PR, successful CI run, counts, screenshot inventory, and checksums. Repository CI checks formatting, dependency audit, all unit/model tests, production presentation, then the complete staging browser suite using pinned Chromium, mobile Chromium, Firefox, and WebKit. CI builds are artifacts, not deployments.

Targeted coverage includes every view and alternate, communication changes after navigation, independent disclosures, explicit worked-example continuation, all six relationships, direct entry, keyboard/pressed/expanded semantics, live announcements, heading focus, Back/Forward positions, optional card entry, selected-only drafts, exact authored Unicode/whitespace, copy/clipboard fallback/print, private-marker traffic/log/history/storage checks, and both fallback modes. Existing legacy-tool and Saved Work suites remain enabled.

Responsive tests cover 320, 390, 768, and 1440 CSS pixels. Additional tests apply 200% root text size and actual text-spacing property overrides with fonts unavailable, forced colors, and reduced motion. A 320 CSS-pixel viewport at scale factor 4 exercises the layout corresponding to a 1280px viewport at 400%; it is not native browser UI zoom. A4 and Letter PDF checks retain normal, maximum-length, and newline-heavy card content.

Local review uses Chromium 153.0.8010.0 from a scratch-only browser package because the pinned browser archive download was truncated. Its configuration and dependency are outside the repository. The existing pinned CI matrix remains authoritative for engine coverage. Initial local browser setup failures were resolved without changing app CSP or CI settings.

Automated checks and axe results do not establish full accessibility conformance, learning effectiveness, or founder acceptance. Native browser UI zoom, actual screen-reader reading, physical devices, and human learning/visual evaluation remain review gates. No test uses real private reflection content.

## Safe founder review

Use the successful CI artifact for the exact PR head, or a new disposable checkout on your own computer. Node 24 is required. The final review report pins the SHA; verify it before starting. Do not reuse an existing preview directory or port.

```sh
git clone --branch work/07-practice-ownership --single-branch https://github.com/jimlunsford/only-empowerment.git only-empowerment-work07-review
cd only-empowerment-work07-review
git rev-parse HEAD
npm ci
OE_PRESENTATION=staging OE_RELEASE_BUILD=1 npm run build
npm run preview -- --host 127.0.0.1 --port 4187 --strictPort
```

Open `http://127.0.0.1:4187/#/period/practice`. On Windows PowerShell, set `OE_PRESENTATION` to `staging` and `OE_RELEASE_BUILD` to `1` in the environment before running the build. Use fictional sample wording if testing the optional card. Stop the preview with Ctrl+C. The loopback-only preview does not update development staging or production.

Review both messaging conditions and return between views, open several response comparisons, inspect all three evidence records and the household agreement, read all six connections, then optionally create/edit/copy/print/clear a synthetic card. Also enter with an existing card and a selected-only draft. Review native zoom, keyboard use, and assistive-technology reading separately before acceptance.
