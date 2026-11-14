# Work 23: navigation and legacy access

Authorized November 4, 2026 under Product Vision v0.47 and the accepted Work 22 design, with the founder's deletion wording refinement. Base: `2a344613ca71f534d1fa468f09ba4a15fc6d8f0c`, Work 20 PR #24. Target: `work/20-empowerment-experience`. This is a source candidate, not a deployment or merge.

The shared header contains Why PERIOD?, Explore the values, and Optional Standard Card. Explore reuses the homepage teaching-order section. Six-value navigation remains inside learning pages. The footer has direct About this site and Existing work groups, source commit, attribution, license and no-warranty notices.

Legacy tools, Saved work, the retained Approach route and Privacy & source use the approved framing. Delete legacy tool data describes the unchanged owned-key deletion and six legacy session reset. The separate memory-only Standard Card remains untouched. Failure and cross-tab notices no longer imply that all application state or verified saved records were cleared.

The existing App and session hooks stay mounted. The small routing adjustment tracks the public fragment as well as its normalized page, so the shared Explore link can focus the existing section from the homepage and update current-location indications. Back/Forward use the existing saved positions, including same-page anchors. No private state enters history.

No storage keys, parsers, payload schemas, limits, tools, lesson content, handoff functions, static reading generation, server configuration or dependency versions change. No migration, automatic save, analytics or new framework companion is introduced.

## Verification contract

Run formatting, TypeScript, both presentation builds, unit tests, dependency audit, production shell checks and the complete four-project browser suite. Existing tests now navigate through the retained teaching path and direct footer access. New navigation tests cover retained routes, same-page/history focus, raw six-type record preservation, unrelated keys, Standard Card preservation through cancellation and deletion, denied storage, keyboard order and responsive/emulated accessibility checks. New print evidence covers six lessons, six legacy artifacts, the separate card and five no-JavaScript reading documents on A4 and Letter.

Browser screenshots, fictional test fixtures, PDF exports and expected print text are attached to test artifacts. These are automated browser-engine checks. Manual screen-reader listening, physical devices/printers, native toolbar zoom, operating-system high contrast and visitor comprehension need separate hands-on review. Exact final-commit results and visual inspection findings belong in the Work 23 handoff, not inferred from this test contract.

Rollback is a later authorized application-build switch. It requires no reverse data migration. Do not clear saved records as part of rollback.
