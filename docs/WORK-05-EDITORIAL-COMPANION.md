# Work 05: Editorial Companion implementation

This is a bounded internal-review candidate based on Work 02 commit `f2f3ef3171ce2c3937a89f989df35b3dc12b7a7a`. It implements Product Vision v0.14's approved Work 04 visual direction for the introduction, Ownership, the existing standard exercise, and its finished card. Public publication of the proposed educational copy remains a separate author decision.

## Presentation and boundaries

The PERIOD routes use self-hosted Source Serif 4 and Source Sans 3, warm paper, evergreen, sage, and clay. Font licenses travel with the public assets and are reproduced in THIRD_PARTY_NOTICES.md. Their CSS is scoped to `.period-shell`; legacy pages retain their original shell and styling. No dependency, storage schema, exercise state model, analytics, curriculum, hosting, or release settings change.

The introduction uses the approved paired hero, meaning panel, value/standard comparison, six-value sequence, origin, and contextual book invitation. Its mobile meaning panel precedes the primary action. Ownership retains its entire meaning, everyday example, responsibility/blame distinction, application, reflection, and Purpose transition, with a semantic response diagram. Only Ownership is linked in the six-value sequence.

The exercise uses an editorial teaching column and writing interface. On mobile the first input comes before the optional teaching disclosure and example. The disclosure retains the full teaching and guardrail, with privacy guidance before the form. The finished card emphasizes the exact authored standard and retains the chosen/not-demonstrated status, next application, optional correction, attribution, and optional copy/print/edit actions.

Keyboard focus uses a separated 3px evergreen outline with 4px offset and a paper separation ring. Invalid inputs retain a distinct 2px error border and associated descriptive error text. Forced-color presentation uses system focus color and a double invalid border. Print styling allows authored text to wrap and continue across pages.

## Four bounded standard amendments

1. Permit the approved self-hosted typography and palette within the PERIOD scope.
2. Permit semantic diagrams that explain a teaching relationship, with equivalent text.
3. Permit meaningful numbered, connected PERIOD teaching order; preserve peer treatment for legacy tools.
4. Consolidate internal-review notices while retaining truthful environment, source, build, privacy, and artifact status information.

The standard still prohibits decorative numbers, redundant labels, meaningless visual furniture, inaccessible controls, and unnecessary complexity.

## Internal-review copy register

Existing teaching in `period-content.ts` is unchanged. New presentation wording is proposed internal-review copy, not a quotation from the manuscript or approval for publication.

| Presentation adaptation                                                                    | Treatment                                                                                                                             |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| “Put your values into practice.” and the free-companion introduction                       | Work 04 hero presentation; the lead is isolated in `period-presentation.ts`.                                                          |
| Value versus standard                                                                      | Preserve the original three sentences exactly, splitting them into typographic blocks. Do not adopt Work 04's suggested tightening.   |
| “The negotiation”, “The standard”, sequence and origin headings                            | Work 04 organizational labels around the unchanged explanation and example.                                                           |
| Six-value path, availability note, 1 of 6, Responsibility → Direction                      | Orientation only. The five unfinished lessons remain unlinked.                                                                        |
| “What you cannot control” / “What you can own” and action lists                            | Work 04 diagram summary in `period-presentation.ts`; the complete source example and guardrail remain adjacent.                       |
| “Read the meaning…”, “No answer required”, “Put it into practice”, Ownership exercise link | Navigation/instructional adaptations; no additional exercise fields or required answers.                                              |
| Mobile teaching disclosure, result action headings, consolidated review notice             | Functional organization and truthful candidate status. Existing validation, privacy, export, and artifact-status wording is retained. |
| Typography-only book title                                                                 | A typographic source identifier, not an invented cover or altered book. The official author destination remains unchanged.            |

## Composition comparison

The review package pairs functioning-application screenshots with the approved Work 04 compositions at 1440px and 390px. Deliberate differences are the required earlier mobile meaning panel, earlier mobile input, independent focus/error styling, the retained original value/standard sentence, and truthful environment/build details. Real form state, validation, clear confirmation, clipboard recovery, character counts, and source status remain functional. Long text and fallback-font stress layouts may wrap more than the fixed-copy boards.

## Verification and limits

The companion review package records exact run results and final commit identity. Existing unit and browser suites cover privacy, history, exact authored wording, copy recovery, cancellable clearing, no-JavaScript teaching, and saved records. Additional browser checks exercise mobile order, focused errors with axe, font failure, 320px reflow, 200% text with spacing overrides, a 400% viewport-equivalent layout, and long/newline-heavy A4 and Letter output.

A 320 CSS-pixel viewport with device scale factor 4 tests the layout corresponding to a 1280px viewport at 400%. It does not establish native browser UI zoom behavior. Local rendering uses the available Chromium 131 because the pinned browser download was truncated in this environment; the repository CI runs the pinned Chromium, Firefox, WebKit, and mobile Chromium configurations. Native zoom, assistive-technology reading, and founder visual acceptance remain human review gates. Automated axe checks do not establish full accessibility conformance.

Legacy comparison uses the untouched Work 02 baseline for eight routes at both requested widths, comparing visible text, layout geometry, computed typography/colors, controls, and viewport fit. The paid manuscript is not added to the application or review package. No merge or deployment is part of this work.

## Private founder inspection

Use a separate disposable checkout on your own computer. Do not reuse a running preview's directory or port. Node 24 is required.

```sh
git clone --branch work/05-editorial-companion --single-branch https://github.com/jimlunsford/only-empowerment.git only-empowerment-work05-review
cd only-empowerment-work05-review
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4185 --strictPort
```

Open `http://127.0.0.1:4185/`. Inspect Ownership and the standard exercise using the visible navigation, then create, edit, copy, print, cancel clearing, and clear a disposable sample. Resize to 1440px, 390px, and 320px; inspect native zoom and keyboard behavior. Check legacy tools through the footer. Stop the process with Ctrl+C after review. This loopback-only preview does not update Rocky, staging, or production.
