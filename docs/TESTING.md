# Testing standard

Test meaningful user behavior and trust boundaries. Coverage percentages are not a goal.

## Shared automated checks retained in the suite

- Pure validation rejects empty and excessive responses with actionable errors.
- Plain-text output preserves entered text and states that a planned action is not completion.
- Source guard rejects current runtime network/persistence/evaluation/unsafe HTML APIs. It is a regression alarm, not a complete security proof.
- HTML CSP includes local-only scripts and no network/form answer submission.
- Browser tests visit all routes, run axe, and check viewport overflow; a 320px regression exercises reduced-motion mode and a maximum-length unbroken answer.
- Next Move and the other accepted tool suites retain validation, focus, text escaping, backward edit, cancel/confirm clear.
- Shell privacy checks use a real Next Move artifact and keep synthetic private markers out of requests and implicit storage. Internal navigation retains unsaved work; reload discards it. Explicit saving, deletion, and storage boundaries remain covered by the accepted tool suites.
- Keyboard skip link, route heading focus, missing-route recovery.
- Clipboard failure has manual-copy guidance; print media hides chrome and preserves output.
- Build metadata and footer identify the same source.

Run across Chromium, mobile Chromium, Firefox, and WebKit. Mobile automation is an emulation check, not a real-device certification.

Browser baseline remains Chrome/Edge 109+, Firefox 115+, and Safari 16.4+. `tests/artifact-text.test.mjs` initializes the actual renderer with `Intl.Segmenter` present and absent, checking exact authored text, Unicode code-point preservation, discretionary breaks, and the normal grapheme path. `tests/browser/artifact-text.spec.ts` removes the API before application scripts load and exercises startup, artifact rendering, escaping, exact text, and 320px reflow at 200% text size in both conditions. These deterministic API-absence checks do not establish direct Firefox 115 execution. Direct Firefox 115 hands-on testing was unavailable for this fix; the ordinary browser suite uses the pinned Playwright browsers.

## Analytics policy and current-runtime boundary

The [Analytics policy](ANALYTICS-POLICY.md) governs future production work. Policy/copy tests distinguish future production Google Analytics from current disabled staging, reject retired blanket promises, and retain the categorical exclusion of authored private content. Existing network, cookies, private-marker and restrictive CSP checks remain unchanged for the current runtime in both presentations. A policy correction does not authorize weakening them.

Before any later analytics activation, explicitly review the integration and event allowlist; capture actual analytics requests across answer entry, artifact creation/editing, Saved Work, copy, navigation, and result events with synthetic private markers. Prove markers never appear in request URLs, headers or bodies, including event names/parameters, page locations/titles and user properties. Verify minimal configuration and prohibited features under the canonical policy. These are future implementation gates, not tests claimed to pass against an integration that does not exist.

## Presentation-mode verification (Gate A2)

`node --test tests/presentation.test.mjs tests/privacy.test.mjs` builds both modes into temporary directories and inspects generated HTML, robots, JavaScript, and build metadata. It checks staging as the unset default, production indexing, all six tools in no-JavaScript text, removal of development scaffolding, staging-only log wording, unchanged CSP, removal of stale output assets, and rejection of invalid modes. Runtime privacy/CSP guards formerly in `preview.test.mjs` are preserved in `privacy.test.mjs`; only the two obsolete preview-model tests are removed.

Normal CI runs focused `presentation.spec.ts` and `shell.spec.ts` against a production-intended local build across all four browser projects, then rebuilds explicitly in staging mode and runs the full ordinary suite. Results use separate `test-results/production` and `test-results/staging` directories. Both runs use the existing zero-retry configuration and local preview server, never the live host. CI also runs `npm audit` for the pinned dependency set.

The shell keeps route/axe/keyboard/320px/source checks, replaces the preview with Next Move for private-marker and long-artifact checks, and tests `#/preview` and unknown tool IDs as not-found routes. Preview-only validation and clipboard tests are removed because the existing Next Move suite covers those actual product behaviors, including hostile input, clear cancellation/confirmation, failed copy, and print. The deployed-host tests likewise use Next Move for future candidates; they are not executed for this change, and the current pre-A2 host does not yet implement the new presentation metadata contract.

## Before each finished tool is accepted

Test explicit state transitions, optional questions, backward revision, empty/long/non-Latin inputs, invalid states, output mapping, completion vs planning, finite handoffs, cancellation, and unsaved exit behavior. Once persistence exists, test explicit opt-in, storage denial/quota/corruption/schema versions, truthful save state, selective deletion, full local deletion, and multi-tab behavior.

## Release gates beyond automation

Manual keyboard review, readable focus and zoom/reflow at 320px, 200% text and 400% browser zoom, real phone touch use, reduced motion/forced colors, screen-reader flow, copied text inspection, multi-page print/PDF inspection, CSP/header checks on actual host, public-source/build byte comparison, dependency review, and infrastructure log-retention verification.

Axe cannot certify WCAG compliance. Network tests exercise known paths and synthetic inputs; they do not prove absence of malicious behavior in every possible deployment. A screenshot is not proof that keyboard or screen-reader behavior works.

Use `docs/PHASE-7-ACCEPTANCE.md` for current acceptance results and testing limits; `docs/PHASE-1-STATUS.md` remains historical. Planned tests must not be reported as passes.

## Deployed staging verification

Use `npx playwright test --config playwright.staging.config.ts` to run against the fixed HTTPS staging URL. This does not start a local server or deploy anything. The foundation workflow also offers the manual `verify_staging` boolean input. Ordinary PR/main runs do not depend on VPS availability.

The staging config uses zero retries and checks the independently pinned deployed commit, headers, redirects, cookies, local/session storage, IndexedDB, caches, service workers, synthetic answer request capture, and laptop/mobile/print layouts. Supply the accepted application SHA independently; never infer it from the host under test. Generated artifacts expire after seven days; the permanent acceptance record summarizes executed results and limitations.

For a later accepted staging artifact, supply `OE_STAGING_COMMIT` (full lowercase 40-character SHA), `OE_STAGING_VERSION` (SemVer), and, for an RC, `OE_STAGING_TAG` (`v` plus that version). An untagged development build uses an empty/omitted tag. The staging config rejects missing or malformed pins before host requests. Manual workflow inputs are `staging_commit`, `staging_version`, and `staging_tag`; none are inferred from the host or workflow SHA.

The historical Phase 7 deployment remains `a7e8ec325703856542aa29236776be6351604b33`, version `0.1.0-dev.7`, untagged and without presentation metadata. Its exact metadata shape is retained as a narrowly pinned compatibility case. To repeat its full historical acceptance, use the recorded Phase 7 suite/workflow revision `b3a9b45965c318312360b9bb8385dadc8f784dd5` and explicit `staging_commit`, rather than applying later A1/A2 assertions to old application bytes. Current RC verification must use the current suite and the new independent version/tag inputs. No deployed verification is performed in A3a.

## RC source and artifact checks (Gate A3a)

`node --test tests/release-state.test.mjs tests/staging-expectations.test.mjs tests/artifact-provenance.test.mjs` covers exact clean/tag/version validation with deterministic fixtures (no tags created), independent staging pins, and two actual generated presentation builds with complete manifests. It verifies the preserved production files survive staging rebuilding unchanged, while the two modes retain different bytes and identical source identity. Existing presentation tests retain default/invalid-mode coverage.

Tag pushes matching `v*` run the same required verification, with full history/tags and strict release validation before installation and again in each build. Ordinary untagged PR/main builds remain valid. Production browser checks precede the production upload and staging rebuild; the ordinary four-project suite precedes the staging upload. Artifact names and later independent verification are specified in [RC procedure](RC-PROCEDURE.md). Both Playwright configurations retain zero retries. CI evidence is not human/device acceptance.

## Phase 2 reference suite

`tests/next-move.test.mjs` covers all field bounds, text preservation, artifact status, saved-schema validation, corruption/future records, quotas/denial/readback, stale edits, per-record/all-namespace deletion, unrelated data preservation, the 50-record bound, and finite future handoff selection. The runtime guard permits localStorage only in the artifact service and continues rejecting network/unsafe HTML/evaluation APIs.

`tests/browser/next-move.spec.ts` exercises the six-step workflow, all not-ready reasons, legitimate blockers, review errors and editing, internal-route Back, copy success and denied-copy selection, explicit saving and cancellation, reopen/edit/multiple records, deletion, corruption, denied/quota storage, cross-tab deletion, synthetic network markers, hostile content, long output, 320px reflow, forced colors, text enlargement, and print. The same suite is used against staging. Axe runs across workflow, error, pause, review, artifact, save/delete-dialog and saved-work states.

Screenshots and long-card PDF are emitted to test artifacts for actual visual review. Emulated viewport/text checks do not establish real mobile keyboard behavior or screen-reader conformance. Record executed evidence and remaining limitations in PHASE-2-ACCEPTANCE.md. True NVDA/VoiceOver/TalkBack testing remains a production gate unless independently performed.


## Phase 3 Decision Room candidate

Phase 3 adds decision-room unit and browser suites to the existing test structure. Both local and deployed configs run the same four projects and complete Next Move regressions. Configured retries are zero. Synthetic cases cover authored input, options, all lenses, pause branches, records, storage, handoff, network markers, axe, widths, text enlargement, forced colors and print. Manual screen-reader and real-device keyboard claims require actual evidence; automation alone is not certification.

## Phase 4 standards suite

`tests/standard.test.mjs` adds schema/bounds/authorship/source-governance/storage and three-type compatibility tests. `tests/browser/standard.spec.ts` adds the seven-stage workflow, all-section review editing, behavior-list bounds and focus, exact copy/fallback, print, explicit saving, mixed work, failed storage, cross-tab deletion/stale writes, unique markers in every field, hostile text, keyboard-only use, responsive widths, text enlargement, forced colors and axe. Both browser configs discover the new suite without reducing existing coverage; retries remain zero. Semantic snapshots are inspectable accessibility evidence, not actual assistive-technology testing. See PHASE-4-ACCEPTANCE.md for executed results and limitations.


## Phase 5 Reset verification

`tests/reset.test.mjs` checks all seven bounds, exact schema/copy, validity rechecks, source snapshot independence, four-type old-byte compatibility, global limit, corrupt/unsupported records, stale writes and failure/readback/deletion behavior. `tests/browser/reset.spec.ts` exercises manual and saved standards, explicit selection, all three pause reasons, internal navigation memory, edits, standard revalidation, copy/fallback/print, four-artifact Saved Work, privacy markers, storage failures, multi-tab/visibility behavior, keyboard focus, axe, widths 320/360/390/1024/1440, enlarged text, forced colors and reduced motion. All accepted tests remain. Staging config runs the same full suite plus host checks with zero configured retries. Executed counts and actual assistive-technology limitations are recorded in PHASE-5-ACCEPTANCE.md, never inferred from test definitions.

## Phase 6 Rebuild Map

`tests/rebuild.test.mjs` adds strict schema, all authored bounds, action-list bounds, portable copy, governance, worst-case escaping, snapshot independence, five-artifact compatibility, quotas/denial/readback/stale edits/deletion and minimal handoff checks. `tests/browser/rebuild.spec.ts` adds workflow/manual/saved/pause/review paths, focus, copy/fallback/print, mixed Saved Work, storage failures, multi-tab behavior, private-marker traffic capture, handoff inclusion/exclusion/replacement, complete receiving workflow, long Unicode and reflow/accessibility checks. Both existing configs discover it; all accepted tests and zero retries remain. At the historical Phase 6 checkpoint, staging host metadata expected candidate version dev.6 with an independently pinned source SHA. Real assistive-technology and device testing are separate unexecuted gates.


## Phase 7 Do It Now

`tests/do-it-now.test.mjs` covers Begin/result invariants, three truthful statuses, all bounds, exact shape/key/version, copy, escaping, timer deadlines, handoff validation, source governance, six-artifact byte compatibility, quota, storage/readback/stale-write/deletion failures. `tests/browser/do-it-now.spec.ts` exercises direct/pause/review/result flows, timers and navigation, copy/fallback/print, save/reopen/edit, six-type Saved Work, failures, cross-tab deletion, visibility, private markers, handoff preview/exclusion/replacement, keyboard/focus, axe and widths 320/360/390/1024/1440 with enlarged text, forced colors and reduced motion. Existing suites stay intact. Both configs use four projects and zero retries; only the staging expected version advances to dev.7. Executed results and unavailable physical-device/assistive-technology checks belong in PHASE-7-ACCEPTANCE.md.


### Do It Now screenshot evidence

Do It Now retains full-page Chromium/mobile Chromium review captures. Only the specific `Protocol error (Page.captureScreenshot): Unable to capture screenshot` condition triggers one distinctly named viewport fallback. A `*-capture-evidence.json` file and Playwright attachment record the requested image, project, original error and fallback result; a `screenshot-degraded` annotation marks the test. Both recognized capture failures permit subsequent product assertions, with missing review images reported separately. Unexpected capture, output or attachment errors remain fatal. No test retries or settling waits are added. The existing browser-review artifact includes these files.

Node tests validate classification and capture/reporting decisions using small injected capture functions, not real browsers. Actual image validity and functional workflows require the normal exact-head four-project GitHub Actions gate. For this correction, pinned local browser executables are unavailable, so browser verification runs in that existing CI environment.
