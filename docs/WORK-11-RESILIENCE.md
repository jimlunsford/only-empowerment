# Work 11: Resilience educational experience

Resilience is the third complete PERIOD lesson. Its twelve sections teach useful persistence, adaptation, limits, support, safety and observable return. One fictional case, **When the plan meets pressure**, changes the conditions around Alex's method while retaining the worthwhile direction and governing standard. All five alternatives are available as complete reading, including without JavaScript.

This implements founder-approved Work 10 v1.0 and Product Vision v0.27 section 1T for internal evaluation. Authorization is an isolated feature branch, verification and a stacked draft PR only. No merge, deployment, earlier-branch modification or Product Vision edit is included.

## Source fidelity

Before application edits, the complete current Product Vision, Work 10 design Doc, Work 04 Editorial Companion and current Project Markdown manuscript were read directly. The Work 10 PDF was extracted and checked against the approved copy; the design archive was unpacked and its twenty original PNG checksums verified. This is a fresh direct reading of the Markdown, not a claim based only on the designer's historical Word-source substitution.

| Source | Verification and application |
| --- | --- |
| [Product Vision v0.27](https://docs.google.com/document/d/1W1J6OAoM-YjVP8d2TIrstWhm3UOWQyEnfCB13fDPp1Y/edit), section 1T | Founder approval and exact additional paragraph distinguishing useful persistence from changing a blocked, harmful or unworkable method. |
| [Approved Work 10 v1.0](https://docs.google.com/document/d/1ee30lCM-Mc1_749JmmMkiiSgUZOeTZ8ZxVvv5skbMLY/edit) | All twelve lesson sections, six relationships, five independent cases, fifteen response explanations, actual-return continuation, interaction contract and bounded three-lesson navigation. |
| [Work 10 review PDF](https://drive.google.com/file/d/100HxTIb9jjR8xUPHQ7N8phgTwwEJMZrd/view) | 38 pages; all 144 approved teaching/case/navigation strings also found in the extracted PDF and native design Doc, allowing whitespace and apostrophe normalization for the extraction comparison only. |
| [Work 10 design archive](https://drive.google.com/file/d/1KVuGYH0UunZWposhN65NoCK7dDAXR8uA/view) | The unchanged `proposed-copy.json` object is the source of `src/period-resilience-content.ts`. Its canonical JSON hash is locked by a unit test. Desktop and mobile compositions guide the semantic implementation. |
| Project source `book_1.docx.md` | Read all 2,999 lines. SHA-256 `974ebbbb57d5b5f72f6258af6afa0ff02eab36e6dba3c8ad0639a2a430a72dfe`. Teaching order, whole Resilience chapter and adjacent Purpose/Integrity teaching directly checked. |
| [Approved Editorial Companion](https://docs.google.com/document/d/1z3JAVYA6K4C5tWnZSRj9wb_niWzFbbErVDusqwcLun0/edit) | Existing Source Serif 4, Source Sans 3, paper/evergreen/sage/clay tokens, readable hierarchy and restrained interaction. Current `docs/UI-DESIGN-STANDARD.md` also applies. |
| [Work 09 PR #19](https://github.com/jimlunsford/only-empowerment/pull/19) | Exact baseline `65a89d692e44233a0be1b87e1ecaa1316269366f`. Existing route, privacy, card, book and fallback behavior retained. |

Source file hashes:

```text
Work 10 PDF         6f6c682e5faa7647219a461c5ffed5c68c8be71c781568aaf4e784500b7e1dd3
Work 10 ZIP         f36d481fd0b24c0626c7cf43f2342b2b5e829766501e54e36e7e1c63bb64389f
proposed-copy.json  ee2a49b0d79b4fcb34ffab529aedf7b04e16c6d5fed2083311b9e687b649b7ae
Canonical copy JSON 96ad7684b970d2a13d6ce042393436495803a88462dbffc3fd54811a8f007a88
```

The manuscript is the philosophical authority; the approved Work 10 text is the exact visitor-facing adaptation. Alex and Morgan are explicitly fictional, including the action continuation. They are not presented as Jim's biography or manuscript quotations.

| Implemented teaching | Direct manuscript relationship |
| --- | --- |
| L01 direction under pressure; L09 connected Code | Teaching order, lines 359–513; Resilience opening, 1097–1137. Ownership establishes responsibility, Purpose direction, Resilience protects it, Integrity checks alignment, Discipline structures repetition and Empowerment supports capability. |
| L02 standard and method | Resilience, 1193–1259: adaptation keeps the mission active while the strategy changes; effort, rest, accountability, environment and patience respond to the facts. |
| L03 ordinary persistence | Resilience, 1139–1191 and 1481–1549: repetition, boredom, delayed results and the absence of applause still require useful work. The founder's full clarification is visible outside disclosures after the active comparison. |
| L04 hard versus harmful | Resilience, 1393–1427: useful difficulty differs from harm, ignored injury and unsafe conditions. The approved adaptation explicitly removes any duty to confront or endure further abuse. |
| L05 rest and support | Resilience, 1193–1259; Ownership, 741–757: help, appropriate treatment, sleep and practical support can carry responsibility. Ongoing care is not framed as failure. |
| L06 missed agreement and actual return | Resilience, 1273–1331 and 1465–1479: a miss is faced without becoming identity; a return requires action. The fictional continuation supplies observed actions only within the story and does not guarantee Morgan's trust. |
| L07 recovery and unperformed strength | Resilience, 1429–1463 and 1481–1535: protective response, environment, support and treatment; no promise that willpower prevents setbacks. |
| L08 practical judgment | Resilience, 1203–1259 and 1465–1479: protect the standard, respond to real constraints, then carry out the available response. |
| L10 Integrity transition | Teaching order, 415–431; Resilience ending, 1551–1559; Integrity chapter begins at 1561. Endurance alone cannot establish honesty or alignment. |
| L11 optional reminder; L12 book | Work 10's approved application scope. The card records intention, not action or mastery. The established book destination remains. |

## Repository and read-only baseline

Before development, main was `ac4d72519fcce83aaf75c75ec06bbfc34fcd0700`. The following PRs were open drafts and were not modified:

| PR | Head | Base |
| --- | --- | --- |
| #16 | `work/02-period-experience` at `f2f3ef3171ce2c3937a89f989df35b3dc12b7a7a` | `main` |
| #17 | `work/05-editorial-companion` at `43ba8627ad1881072bd3290b3adccd7228cd6fb6` | `work/02-period-experience` |
| #18 | `work/07-practice-ownership` at `091f65b163d7be55ec3478df3e6cb8c7f4c5e390` | `work/05-editorial-companion` |
| #19 | `work/09-purpose-experience` at `65a89d692e44233a0be1b87e1ecaa1316269366f` | `work/07-practice-ownership` |

Read-only `https://dev.onlyempowerment.com/build.json` reported the same clean Work 09 baseline. The candidate is `work/11-resilience-experience`, stacked directly on `work/09-purpose-experience`. Build and browser artifacts are review evidence, not deployments.

## Implemented behavior

| Surface | Behavior |
| --- | --- |
| `/#/period/values/resilience` | Complete twelve-section lesson with every approved paragraph, all six relationships, optional card, book and honest unavailable Integrity notice. |
| `/#/period/resilience/pressure` | One labeled native select; initial `slow`. Five alternative conditions update facts, method, revision, retained standard, costs, review point and response explanations together. Aim and standard stay present. |
| Disclosures | First explanation open, other two independently closed. Changing condition remounts only the case, resetting its explanations and optional actual-return continuation. Full reading disclosure remains independently open or closed. |
| Announcements and state | Empty initial polite atomic status; concise text only on an actual condition change. Select focus stays in place. Leaving/reentering, Back/Forward reentry and reload reset to slow. No condition is stored in URL, history or persistent browser storage. |
| Failure recovery | A caught case-render failure shows all five cases expanded. Root HTML remains readable if app scripts are disabled, blocked or throw before mounting; it links to the independent static export. |
| `/read/resilience.html` | Direct HTTP HTML asset generated from the same approved copy. All lessons, cases, explanations and action continuation are expanded. No script, select, status, closed disclosure or dependency on hash routing. Matching build-time CSS uses existing fonts and palette. |
| Reading link | Visible on both Resilience views; case targets `#pressure-notes`. Labeled as opening a new tab, with `noopener noreferrer`, so navigating to the independent static document does not discard an existing memory-only private draft. |
| Navigation | Ownership remains the recommended start. “Explore the lessons” focuses the same-page teaching-order section. Three available lessons are links; Integrity, Discipline and Empowerment remain text. Purpose gains “Continue to Resilience.” |
| Standard Card | Existing blank-draft guard preselects Resilience only when every field and selected value is untouched. Case components receive no draft props. Exact authored content, selected-only/whitespace drafts, card/editor view, limits, validation, copy/fallback, print and cancellable clear remain intact. Selected-value guidance links to each of the three available lessons. Mobile spacing retains the existing first-field visibility requirement. |
| Existing tools | Ownership and Purpose interactions, six legacy tools, Saved Work, explicit storage services and book-exit protection remain in their existing components. |

The only new interaction state is a fixed fictional condition identifier and its announcement text, held inside the case component. No account, personal assessment, completion status, score, schema, persistence, submission or telemetry is added. Dependencies, CI workflow and deployment configuration remain unchanged. The bounded static export is a build asset, not a rendering-framework migration.

## Visual comparison

The final review package provides actual browser screenshots and paired approved/implemented excerpts. The comparison checks the relationships below rather than claiming pixel identity with a static composition.

| Approved Work 10 composition | Implemented relationship |
| --- | --- |
| Lesson at 1440 px | Full-width serif opening, left teaching-order rail, local navigation above an 840 px reading column, all sections and plain six-value rows. |
| Lesson at 390 px | Heading, compact teaching order, local links and full lesson in document order. Integrity remains explanatory text with a clay rule and no invented lesson link. |
| Pressure at 1440 px | Prominent sage aim/standard block, native selector, changing facts, current method beside the sage possible revision, separate retained standard/cost/review text and native response disclosures. |
| Pressure at 390 px | The same material stacks in reading order; native controls and summaries retain usable target sizes. No fixed-height text clipping or horizontal interaction. |
| Actual return and full reading | Actual-return continuation is an independent native disclosure in the missed case and always expanded in full reading. Complete reading does not depend on the selected case. |
| Bounded homepage | Existing opening, Ownership recommendation, structure and tools remain; only approved lead, lesson invitation, third lesson and availability change. Header uses two columns on narrow screens. |
| Deliberate implementation differences | Existing build/internal-review notices and footer remain. Functional sentence-case method labels replace decorative uppercase labels under the repository UI standard; redundant breadcrumbs are omitted. Native select/disclosure rendering varies by engine. The mandatory paragraph adds page height. |

## Verification and limits

The final handoff pins the tested commit, draft PR, GitHub run and review artifacts. Local formatting, TypeScript, audit, unit/model and build checks run before handoff. The unchanged Product verification workflow additionally checks production presentation, then the complete staging suite in Chromium, mobile Chromium emulation, Firefox and WebKit. No checks are disabled for this work.

The targeted suite covers all approved content, coherent alternatives, every response, default/reload/reentry, native disclosure independence/reset, actual return, same-page and route focus, Back/Forward reading position, select naming, retained focus and genuine-change announcements. It tests all static copy through direct HTTP and the root fallback with JavaScript disabled, blocked and failing, plus caught interactive-render failure. Card and synthetic private-marker tests inspect draft preservation, copy/manual fallback, printing, cancel/clear, network, history, logs and browser stores. Existing six-tool and Saved Work regression suites remain enabled.

Screenshots and reflow assertions cover 320, 390, 768 and 1440 CSS pixels. Additional checks combine 200% root text, increased text spacing, unavailable fonts, reduced motion and forced colors. The 320 CSS-pixel width at scale 4 models the reflow width of 1280 pixels at 400%; it is not native browser UI zoom. Computed colors are measured for headings, body text, links, controls, boundaries and focus indicators in all five cases and static reading. Axe checks the lesson, every selected case, complete reading and static document.

The local runtime cannot install the pinned browser: the official CDN returned HTML instead of a valid archive. The attempted local browser run failed before application execution because its executable was unavailable. GitHub CI provides browser execution and real captures; no app security or browser sandbox settings are weakened.

The initial CI run exposed mobile card spacing after the header addition, two stale/ambiguous test selectors, and Firefox reporting a 44 px target as 43.999969482421875 px. Mobile spacing and selectors were corrected; the legacy target-size measurement now allows 0.001 px numerical rounding while retaining its 44 px requirement. The next run passed all prior regressions and exposed a static-reading test error: a same-document hash navigation returns no HTTP response. That check now starts from a fresh document before asserting HTTP status. The unchanged first-field viewport assertion and all browser suites are rerun on the final candidate.

Automated tests and screenshot review do not establish full accessibility conformance or learning effectiveness. Actual screen-reader use, physical devices, native browser UI zoom, native mobile picker operation and formative visitor learning review remain human review tasks. Printed-card tests verify print invocation and print CSS, not a physical printer. The founder must separately accept educational and visual fidelity; this candidate is not approved for public publication.

## Safe local founder review

Use a new disposable checkout with Node 24. Use the exact tested SHA supplied in the final handoff, not an unverified moving branch tip. Bind to loopback on an unused port.

```sh
git clone --branch work/11-resilience-experience --single-branch https://github.com/jimlunsford/only-empowerment.git only-empowerment-work11-review
cd only-empowerment-work11-review
git checkout --detach <exact-tested-SHA-from-handoff>
git rev-parse HEAD
npm ci
OE_PRESENTATION=staging OE_RELEASE_BUILD=1 npm run build
npm run preview -- --host 127.0.0.1 --port 4191 --strictPort
```

For PowerShell, set `$env:OE_PRESENTATION = 'staging'` and `$env:OE_RELEASE_BUILD = '1'` before `npm run build`. Open `http://127.0.0.1:4191/#/period/values/resilience`, then its pressure case. Direct static reading is `http://127.0.0.1:4191/read/resilience.html`. Stop the server with Ctrl+C. These commands do not publish or update staging.

Read all twelve sections; compare all five independent conditions; open every explanation and the missed-agreement action continuation. Keep complete reading open while switching conditions. Reload and return between routes. Try a selected-only or fictional written Standard Card before and after the case and text-only link. Disable JavaScript and follow the root fallback. Check actual browser zoom and preferred assistive technology. Use fictional private text only. Return findings to the Command Chat for acceptance and any separately authorized next work.
