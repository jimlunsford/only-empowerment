# rc.2 visual-language review

Date: 2026-10-03. Branch: `design/remove-decorative-labels`.

## Starting state and scope

Remote main, cloned HEAD and immutable `v1.0.0-rc.1` all resolved to `a3b20aa1f3eff98dcfbda556093a0cf25737bb22`. The checkout was clean. Package and both lockfile root markers were `1.0.0-rc.1`; no rc.2 tag existed. A fresh branch was created from that exact main.

This is a visual-language refinement from hands-on rc.1 review, not a feature or full redesign. Proposed version is `1.0.0-rc.2`, changing only the three version markers in package.json/package-lock.json. The rc.1 changelog entry and tag are preserved.

## Changes and retained meaning

| Surface | Cleanup | Preserved information and behavior |
| --- | --- | --- |
| Home and Tools | Remove collection/hero/privacy kickers, peer-card indices, repeated Try-tool pills and the card-top row | Situation, title, description, output, full-card link, arrow, hover/focus affordance |
| PageIntro and all callers | Remove the label prop and visible label markup | Page heading, intro copy and route focus |
| Shared Lesson and six tool workflows | Remove visible kickers, tool-header label wrappers, Next Move's duplicate lesson number, redundant ownership/result captions | Lesson headings, aside accessible names, named tool regions, actual workflow progress, fields, errors, warnings and transitions |
| Six artifact views | Remove repeated Only Empowerment/tool attribution headers and their wrappers | Artifact headings, authored sections, status badges, copy, print and source footnotes |
| Saved Work | Remove decorative ordinal; place useful artifact type/status below the user-authored title in ordinary mixed-case text | Record data, accessible action identifiers, open/edit/save/delete and existing-work confirmation |
| Approach | Remove custom conceptual indices and number-column wrappers | Ordered semantic list, headings and explanatory copy |
| Privacy, Not Found, pause states and footer | Remove redundant visible introductory labels, pause kickers and repeated footer slogan | Privacy warnings, recovery links, status, author and build/source attribution |
| CSS | Retire label/index/pill/header selectors and related responsive/print overrides; simplify conceptual layout and artifact status spacing | Established colors, fonts, surfaces, borders, responsive layout, forced colors, reduced motion and print rules |

SourceNote, navigation, staging banner, dialogs, form instructions, empty/error states, handoff previews and saved/reopened flows were audited. Useful source attribution, environment status, controls, warnings and accessibility semantics remain. No model, schema, persistence, lesson-copy, timer or network source module changed. Parsed package/lockfile comparison confirms all dependency entries are identical after accounting for the version markers.

## Permanent standard and regression guard

[UI-DESIGN-STANDARD.md](UI-DESIGN-STANDARD.md) is canonical and linked from README, DEVELOPMENT.md and UX-AND-ACCESSIBILITY.md. Every visible element must communicate information, enable an action or establish necessary hierarchy. If removing it does not make the interface harder to understand or use, remove it.

Prohibited defaults cover decorative labels, indices, redundant CTA pills and ornamental metadata. Meaningful progress, ordered steps, forms, validation, environment status, warnings, artifact statuses, metadata and accessibility-only semantics remain allowed. Future user-facing work must read and comply with the standard and receive rendered review.

`tests/ui-design-standard.test.mjs` contains three focused checks: retired class assignments/CSS selectors (`eyebrow`, `tool-number`, `availability`, `step-number`, `lesson-number`); repeated Try-tool text/nested controls in linked tool cards; and the retired PageIntro label API. It does not ban ordinary prose words or attempt subjective visual judgment. All three checks also correctly reject a temporary untouched rc.1 source copy.

The existing Rebuild Map handoff browser test now locates the linked card through its heading instead of the deleted CTA pill. The shell test additionally requires each tool to expose a named region containing its page heading, preserving tool context without a visible kicker.

## Rendered review

All routes below were captured and reviewed in Chromium at **1440, 1024, 390, 360 and 320 CSS pixels**, for 60 route/width combinations. No horizontal overflow or retired class/wrapper occurrence was detected. Contact sheets and full-page images were generated under `test-results/visual-review/`; the ordinary browser suite also generates workflow screenshots, print PDFs and failure traces under its configured output directory. These are local review captures of uncommitted source with truthful `local changes` build metadata, not deployable release evidence.

| Route | Surface |
| --- | --- |
| `#/` | Home |
| `#/tools` | Tools |
| `#/saved` | Saved Work |
| `#/approach` | Approach |
| `#/privacy` | Privacy & Source |
| `#/tools/decision-room` | Decision Room |
| `#/tools/next-move` | Next Move |
| `#/tools/build-a-standard` | Build a Standard |
| `#/tools/reset` | Reset |
| `#/tools/rebuild-map` | Rebuild Map |
| `#/tools/do-it-now` | Do It Now |
| `#/unknown` | Not Found |

Representative lesson, pause, review, confirmed artifact, handoff, saved card, dialog and long-content screenshots were inspected. Shared spacing now follows the remaining headings and content; no empty label/header row remains. Tool cards retain clear links, output separators and balanced padding. Status badges and real progress remain clear. Source and privacy notices remain readable.

The existing four-project suite covers headings/names/landmarks, keyboard and route focus, dialogs, field/error association, status announcements, axe, 320px reflow, enlarged text, forced colors, reduced motion, long authored text, print, storage, deletion, cross-tab behavior, handoffs and privacy. This is automated regression evidence plus rendered review, not new human screen-reader or device acceptance.

## Automated verification

| Gate | Final result |
| --- | --- |
| `npm ci` | Pass, exact locked dependencies; Node 24.19.0 |
| Focused design guard | 3 passed; all 3 reject untouched rc.1 in the negative check |
| `npm run format:check` | Pass |
| `npm audit` | 0 vulnerabilities |
| `npm test` | 123 passed, 0 failed, 0 skipped |
| `npm run check` | Pass |
| Production presentation build | Pass |
| Production presentation + shell, all four projects | 28 passed, 0 failed, 0 skipped |
| Staging presentation build | Pass |
| Ordinary full four-project suite | 464 passed, 0 failed, 12 intentionally skipped |
| Configured retries | 0, unchanged |
| Route/width captures | 60 checked, no horizontal overflow or obsolete decoration |
| Full diff and dependency comparison | Pass; no unrelated source or dependency changes |

The 12 skips are the three deployed-staging tests across four projects. No deployed verification was run. Local browser versions were Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6, as pinned by Playwright 1.63.0. The CDN's invalid Chromium archive response was worked around with the same exact browser version from Google's official mirror; repository dependencies and browser configuration were not changed.

During development, the old Rebuild Map CTA locator failed in all four projects and was corrected to use the linked heading. A later intermediate run was stopped to correct tool naming from an unnamed scoped header to an accessible named section. The final clean browser run above includes both corrections. No retries or relaxed assertions hid failures. Pre-commit local builds truthfully identify uncommitted changes; the normal PR CI verifies clean published source separately.

## Final search classification

No rejected class remains in current user-facing markup or CSS. The staging banner's `Try Next Move` remains intentionally: it is a real navigation link, not a redundant pill inside a linked card. Ordinary uses of “availability” in documentation and a behavioral fixture remain meaningful English. The canonical standard, changelog, review record and regression guard name the retired patterns to explain or prevent them. Historical availability statements remain historical documentation.

## Boundaries

No merge, tag, GitHub Release, staging deployment, deployed-staging verification, VPS access, production change, DNS/TLS change, dependency change or product-semantic change is part of this work. No release artifact or build metadata is relabeled as accepted source. The normal draft-PR CI is allowed to run against the published candidate.
