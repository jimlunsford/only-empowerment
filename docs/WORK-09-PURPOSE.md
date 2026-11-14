# Work 09: Purpose educational experience

Purpose adds a complete second lesson and one fictional comparison workspace. Visitors can examine two worthwhile directions at two levels of capacity, see what each plan protects and postpones, and read every example without operating the controls. The lesson connects Ownership to meaningful direction and explains why pressure introduces Resilience, whose full lesson remains unavailable.

This internal candidate implements approved Work 08 v1.0 and Product Vision v0.23 section 1P. It starts at verified Work 07 commit `091f65b163d7be55ec3478df3e6cb8c7f4c5e390`, on `work/09-purpose-experience`, for a stacked draft PR targeting `work/07-practice-ownership`. Public editorial acceptance, merge and deployment require separate authorization.

## Sources and bounded changes

The complete manuscript and approved design sources were read during Work 08. Before Work 09 edits, fresh native documents were fetched and checked against those complete readings. The current Product Vision changes, including all of section 1P, were read; the approved teaching and visual foundation were unchanged. The exact design-image archive was verified and inspected.

| Source                                                                                                                                                | Traceability into this implementation                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Product Vision v0.23](https://docs.google.com/document/d/1W1J6OAoM-YjVP8d2TIrstWhm3UOWQyEnfCB13fDPp1Y/edit), section 1P                              | Authorization and both exact additions: the evening plan is not Sam's purpose; avoiding the old life can begin rebuilding.                                                                  |
| [Work 08 v1.0](https://docs.google.com/document/d/1XXx9YJD4lBasID6NsrZBq0IYBvPkQYJf6JV5Sj-BNvw/edit), sections 4–7                                    | Full lesson, all four fictional states, shared counterexample, native reading alternative, temporary state, six-value relationships, two-value navigation and honest Resilience transition. |
| Work 08 full-resolution image archive, Library ID `libfile_2f10e6712fcc8191942194c0a3e20197`                                                          | Desktop/mobile lesson, four comparisons and bounded introduction changes.                                                                                                                   |
| Authoritative `book_1.docx.md`, SHA256 `974ebbbb57d5b5f72f6258af6afa0ff02eab36e6dba3c8ad0639a2a430a72dfe`                                             | Teaching order 389–399; Ownership 517–798; Purpose 799–1017, including its Resilience bridge; Living the PERIOD Code. Work 08 section 12 provides the detailed manuscript mapping.          |
| [Approved Editorial Companion](https://docs.google.com/document/d/1z3JAVYA6K4C5tWnZSRj9wb_niWzFbbErVDusqwcLun0/edit) and `docs/UI-DESIGN-STANDARD.md` | Existing Source Serif 4 / Source Sans 3 fonts, paper/evergreen/sage/clay colors, restrained layout and access principles.                                                                   |
| [Work 07 PR #18](https://github.com/jimlunsford/only-empowerment/pull/18), exact baseline above                                                       | Existing routes, four Practice Ownership views, Standard Card guard, successful-render fallback and history/focus conventions.                                                              |

Before work, main was `ac4d72519fcce83aaf75c75ec06bbfc34fcd0700`. PR #16 was draft/open at `f2f3ef3171ce2c3937a89f989df35b3dc12b7a7a`, targeting main. PR #17 was draft/open at `43ba8627ad1881072bd3290b3adccd7228cd6fb6`, targeting `work/02-period-experience`. PR #18 was draft/open at the Work 07 baseline, targeting `work/05-editorial-companion`. Read-only staging reported that Work 07 baseline, clean source and version `1.0.0-rc.3`. Prior branches and PRs are not edited.

`period-purpose-content.ts` contains the approved teaching, shared by the semantic Preact views and build-time fallback. Lee and Sam are expressly fictional adaptations, not author autobiography or new quotations. Neither a grand calling nor moving immediately beyond survival is required. The complete Code remains the standard for living; an optional card only records one intended behavior.

## Behavior and preservation

| Surface                     | Result                                                                                                                                                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/#/period/values/purpose`  | Complete reading lesson, practical examples and distinctions, changing seasons, both neighboring values, all six relationships, optional card and existing book destination.                                                                                               |
| `/#/period/purpose/evening` | Default Steadier work / Usual capacity. Independent native pressed buttons preserve the other condition. Four exact plans include benefits, costs, uncertainty and comparison cues. No scoring or personal fields.                                                         |
| Reading alternative         | Native “Read every example as text” disclosure contains all four complete states. It remains open across condition changes. All essential teaching also exists in build-time HTML with no inert controls.                                                                  |
| Navigation                  | Start with Ownership stays primary; Explore Purpose is secondary. Header has Why PERIOD?, Ownership and Purpose. Both lessons are linked in the six-value path; later values remain nonlinks. Ownership and the Practice Ownership closing view offer Continue to Purpose. |
| Standard Card               | A parameterless entry callback uses the existing `enterPeriodExercise` blank-draft guard. Any selected value, whitespace or authored field preserves the draft and edit/card view. The fictional comparison cannot inspect card text.                                      |
| Existing work               | Four Practice Ownership routes, six original tools, Saved Work, book links, exact-text handling, validation, copy/manual fallback, print and cancellable clearing remain in their existing components.                                                                     |

The only new app state is `{ direction, capacity }`, with fixed fictional enum values. It survives in-site navigation and resets on reload. Disclosure state is native page memory. No controls enter URLs or history payloads. No persistence, account, schema, network submission, analytics or telemetry is added. Dependencies, CI, CSP and deployment configuration are unchanged.

Real selection changes produce one concise polite atomic announcement. Initial render and repeated selections do not announce a change. Focus stays on the activated button. Route navigation and Back/Forward retain the existing heading/position policy. Reading order places controls before direction, plan and consequences.

## Composition comparison

The review package contains actual application screenshots and the final visual comparison. The implemented composition follows these approved relationships:

| Work 08 composition      | Implementation                                                                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose lesson at 1440px | Six-value rail alongside a reading column; large serif title; full teaching; six relationship rows; clay rule introducing pressure and Resilience.                                                         |
| Purpose lesson at 390px  | Heading, compact teaching order, local navigation and full lesson in document order. Relationship names precede their explanations.                                                                        |
| Comparison at 1440px     | Two independent control groups; written current state; sage direction panel beside a readable timeline; three consequence columns; shared counterexample and reading disclosure.                           |
| Comparison at 390px      | Controls, direction, each time block, benefit, cost and uncertainty stack without truncation. No fixed panel heights or horizontal interaction.                                                            |
| Mandatory additions      | The larger-purpose explanation is immediately before the direction/plan. The rebuilding sentence is in the changing-seasons discussion. These paragraphs add height relative to Work 08.                   |
| Shared shell             | Actual internal-review/build notices and existing footer remain. Natural text wrapping and the native disclosure marker differ from fixed boards. At enlarged text the compact path can become one column. |

No four-step Practice Ownership layout, new visual system or remaining-value lesson is introduced.

## Verification

The accompanying final review report pins the commit, PR, CI run, counts, screenshots and measured contrast. The repository's unchanged Product verification workflow checks formatting, dependency audit, unit/model tests, production presentation, then the complete staging browser suite with pinned Chromium, mobile Chromium, Firefox and WebKit. CI build artifacts do not deploy the site.

Targeted Purpose tests cover full teaching and both refinements, exact four-state content, independent changes, repeated selections, truthful costs and uncertainty, unchanged-evening contrast, keyboard/pressed/live semantics, native disclosure, direct routes, two-value navigation, unavailable labels, Back/Forward and temporary defaults. Card tests cover blank, selected-only, whitespace and full Unicode drafts, edit/card view preservation, copy/manual fallback, print and cancelled clearing. Synthetic private-marker tests inspect requests, logs, history and browser stores. Both disabled JavaScript and blocked app scripts must retain complete teaching. Existing legacy regression suites remain enabled.

Responsive checks cover 320, 390, 768 and 1440 CSS pixels, plus 200% root text, text spacing, unavailable fonts, forced colors and reduced motion. A 320 CSS-pixel viewport at scale 4 checks the reflow width corresponding to 1280px at 400%; it is not native browser UI zoom. Automated and axe results do not establish full accessibility conformance or educational effectiveness. Native UI zoom, actual screen-reader use, physical devices and formative visitor testing remain human review work.

Local browser execution is unavailable in this runtime: the pinned Playwright download returned an HTML error, and an intact official Chrome for Testing 153.0.8010.12 archive could not launch because the runtime denies its required socket operation. No repository browser configuration or app security setting was weakened. GitHub CI supplies browser execution and actual captures; local formatting, type, unit, audit and build checks remain available.

## Safe founder review

Use a new disposable checkout with Node 24. The final report gives the exact tested SHA. Verify it before starting, and bind the preview only to loopback on an unused port.

```sh
git clone --branch work/09-purpose-experience --single-branch https://github.com/jimlunsford/only-empowerment.git only-empowerment-work09-review
cd only-empowerment-work09-review
git checkout --detach <exact-SHA-from-final-report>
git rev-parse HEAD
npm ci
OE_PRESENTATION=staging OE_RELEASE_BUILD=1 npm run build
npm run preview -- --host 127.0.0.1 --port 4189 --strictPort
```

In PowerShell, set `$env:OE_PRESENTATION = 'staging'` and `$env:OE_RELEASE_BUILD = '1'`, then run `npm run build`. Open `http://127.0.0.1:4189/#/period/values/purpose`. Use fictional card text only. Stop with Ctrl+C. These steps do not publish or update staging.

Read the complete lesson, explore both conditions in both orders, open the text alternative, and return between values. Try Purpose with an existing selected-only or written card. Review keyboard focus, native zoom and assistive-technology reading. The founder decides educational, copy and visual acceptance separately from CI.
