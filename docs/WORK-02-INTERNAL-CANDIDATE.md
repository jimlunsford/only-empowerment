# Work 02 internal PERIOD candidate

Authorization: October 28, 2026, feature-branch development and verification only. No merge or deployment. This is an internal Ownership slice, not a completed six-value launch. Work 01 teaching copy remains proposed and requires Jim's public editorial approval.

## Source and scope

Read the live [Product Vision v0.12](https://docs.google.com/document/d/1W1J6OAoM-YjVP8d2TIrstWhm3UOWQyEnfCB13fDPp1Y/edit), [Work 01 v1.0](https://docs.google.com/document/d/1xFW-jtWJbV4uir0oTBuVNMd44-yNnojJXZvis5w_B50/edit), and complete author-supplied `book_1.docx.md` before implementation. The current decision register controls over historical tool-first doctrine. Source manuscript is not added to Git or application assets. The runtime contains only the Work 01 introduction, Ownership adaptation, six names/roles, short exercise, worked example and contextual book invitation.

Verified GitHub main and read-only staging build metadata: `ac4d72519fcce83aaf75c75ec06bbfc34fcd0700`, version `1.0.0-rc.3`, untagged, staging presentation. The author page and its Amazon destination were rechecked for the title, author and paperback/Kindle relationship. Only the official author-page URL is used in the new UI; no checkout or tracking is added.

## Candidate experience

- `#/`: Why PERIOD?, origin and attribution, value versus standard, everyday comparison, adaptation disclosure, intentional six-value order.
- `#/period/values/ownership`: complete Ownership lesson, universal-blame distinction, no-writing application, transition explaining why Purpose follows, optional exercise and book invitation.
- `#/period/standard`: one value, two required text responses, optional support/correction. Separate `PeriodDraft`, not the legacy nine-field Personal Standard. Worked example never prefills personal content. Exact-text review, edit, copy and manual fallback, print, confirmation before clear, and chosen-not-demonstrated status.
- `#/period/book`: proposed contextual book copy and official author link, with a leave warning when a new draft exists.
- Unknown/unbuilt value routes explain the slice and offer Ownership. No unavailable lesson is linked as functional. All six names remain in authored order. The other five complete lesson bodies are absent.
- Existing tools, approach, privacy and Saved Work routes remain accessible. No legacy schema, storage service or saved-record migration changed.

## Implementation and reuse

Retains Preact/TypeScript/Vite, palette, typography, shared form/error controls, native confirmation dialog and grapheme-aware artifact rendering. Adds optional character-count and cancel-label arguments to the shared primitives; old defaults remain unchanged. Adds versioned editorial content separate from UI, its own short-card formatter/validation and app-owned memory. The same editorial data generates a static introduction, Ownership lesson, example and paper pattern at build time. It is visible by default and removed only after a successful app mount, so disabled JavaScript and a failed script download both preserve the reading experience.

The hash navigation hook stores only a public integer in history state. Reading positions and focus references stay in memory. Back/Forward restore positions; explicit lesson navigation focuses and reveals Ownership. New authored text is absent from history, URLs, logging, network requests and persistent storage. CSP remains unchanged, including `connect-src 'none'` and `form-action 'none'`. Export is user-initiated. Clear affects this draft only. Browser/OS clipboard synchronization, PDFs, extensions and printers remain outside site control.

Vite was patched from 8.3.0 to 8.3.5 because the baseline dependency failed the existing npm-audit gate with a high-severity advisory. No runtime dependency was added. No production configuration or deployment workflow was changed.

## Verification and review limits

The candidate adds pure model/content tests and a cross-browser journey suite. Coverage includes blank/over-limit validation, code-point counts, unchanged whitespace/Unicode/HTML-looking text, example ownership, draft/card navigation and reload, Back/Forward positions, focus, keyboard operation, clipboard success/denial, print invocation without a success claim, clear cancellation/confirmation, guarded book exit, private request/log/storage/history markers, unchanged legacy fixture bytes, unknown lessons, no JavaScript, axe, widths 320/390/768/1024/1440, enlarged text, reduced motion and A4/Letter PDF captures. Existing regressions remain enabled. Old homepage assertions were updated to verify the new teaching homepage and the still-accessible six-tool catalog; privacy restrictions were not weakened.

Local checks passed: 129 unit tests, formatting, type checking, build and zero-vulnerability npm audit. The broad Chromium/mobile regression run passed 248 cases with six deployed-host-only skips. The refined journey and route-focus suite passed 33 cases across Chromium, mobile Chromium and Firefox. Initial CI exposed a WebKit history-position race: a deferred scroll event could leave the saved reading position stale. The router now snapshots the viewport at navigation time; all 11 local WebKit journey/route-focus cases passed after the correction. Refer to the draft PR's current `verify` result for final exact-head matrix evidence; do not infer approval from superseded or cancelled runs.

Local environment limits: the pinned Chromium CDN returned invalid archives, so local review used Chromium 153.0.8010.0 from a temporary external test installation, without changing repository dependencies/configuration. Firefox required local process-sandbox environment adjustments; WebKit initially lacked host libraries; isolated extraction of Ubuntu packages supplied them for local testing without installing host packages or changing repository dependencies. GitHub CI uses the repository's pinned browsers and installs their host dependencies. Local font availability initially caused missing emoji glyphs in PDF review; installing a temporary review font resolved those glyphs. Text-preservation checks remain distinct from font rendering. Actual NVDA, VoiceOver, physical-phone keyboard interaction and native 400% browser zoom are not certified here. 320px reflow and 200% text checks are partial evidence, not substitutes. Native print-dialog completion cannot be observed; print-media and PDF review verify prepared output. Browser PDF tagging is not certified.

Founder editorial review, real-device/assistive-technology inspection and the Work 01 five-person comprehension study remain outstanding. The supplied manuscript's retail parity and front-matter wording remain Command Chat editorial questions. None blocks this internal implementation or authorizes publication.

## Safe owner inspection

Use a separate local checkout on Node 24, on `work/02-period-experience`. Do not copy files to a server or run a deployment script.

```sh
git clone https://github.com/jimlunsford/only-empowerment.git only-empowerment-work02
cd only-empowerment-work02
git switch work/02-period-experience
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Open `http://127.0.0.1:4173`. This builds and serves locally only. The default staging *presentation* is a label, not a deployment to the existing staging host. Use synthetic words for screenshots and shared review. Reload discards the new draft; copy or print first if needed. To verify independently:

```sh
npm run format:check
npm run check
npm test
npm audit
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

For no-JavaScript review, disable JavaScript and reload the built preview. The bounded linear teaching and paper pattern remain readable. Five remaining lessons and read-all-six mode are intentionally deferred. For release review, Command Chat must separately authorize expanded lessons, public copy, staging preview and deployment.
