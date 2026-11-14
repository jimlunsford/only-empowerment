# Work 16: Discipline implementation

This candidate adds the approved eight-part Discipline lesson and **What the pattern shows** to the existing Editorial Companion. It is stacked on `work/13-integrity-experience` at `aa30f955aa4b99ff45210aa7d24aa1c820201568` and is intended for its own unmerged draft PR targeting that branch. It does not authorize deployment or public publication.

## Content contract and scope

`src/period-discipline-content.ts` contains only the accepted Work 15 visitor-facing lesson and interaction objects, plus local navigation labels. The source archive SHA-256 is `4529c64a0f81961d1b0a64304e0621e0400f6edc29171c7b646ee5c94ee6fe19`. Independent object digests in `tests/period-discipline.test.mjs` protect every approved paragraph, occasion, interpretation, corrective response, status message and limitation. The manuscript and private design metadata are not bundled.

The source review used Product Vision v0.36, the approved Work 15 design and structured-copy archive, the authoritative Discipline chapter with its Integrity and Empowerment transitions and final PERIOD synthesis, and the Work 04 Editorial Companion direction. No substantive source contradiction required a change to the accepted copy.

The comparison retains all seven occasions in one reading workspace. Native radio buttons select between “A strong start then waiting” and “The same method at any cost” beside the fixed “Repeated care with correction” reference. The default returns on reload. State is component memory only. A dedicated initially empty polite status region changes once per user selection; the page is not a live region. Switching does not move focus or scroll.

The founder's three links, **Repeated actions**, **The miss and return**, and **Changed capacity**, are ordinary anchors to existing occasion headings. A narrow normalization in the existing hash router recognizes those heading fragments, including direct loading and the return-to-lesson heading. Unknown fragments retain existing not-found behavior. Selection is not encoded in the URL or history.

`/read/discipline.html` and `/read/discipline.css` are build-time, script-free outputs from the same approved content. They include all eight lesson sections, all three patterns at every occasion, the all-pattern interpretations, corrections, conclusion and source note. Their wayfinding uses plain HTML fragments. The application's failure/no-script surface links directly to this reading page. Printing either comparison selection exposes all three patterns under an explicit heading; it never requires a second print to recover the other alternative.

Navigation now offers five full lessons. Empowerment remains an explicitly labeled orientation. Integrity changes are confined to availability and onward links. The optional Standard Card uses the existing pristine-draft guard. Earlier lessons, their interactions, the six legacy tools, Saved Work, persistence and deployment configuration retain their existing implementations.

## Verification

The repository checks remain `npm run format:check`, `npm run check`, `npm test`, `npm run build`, `npm audit`, and `npm run test:e2e`. The existing Product verification workflow checks the PR head itself, verifies the production-intended presentation, then builds staging presentation and runs all four browser projects with zero retries. These are local/CI build modes, not deployments.

The new unit suite verifies complete source-copy digests, script-free reading parity, exact anchor mapping, private-state boundaries and Standard Card preservation. The new browser suite checks both selections, all seven occasions, native radio keys and focus, one status mutation per change, reload/Back/direct/unknown routes, in-page links, no-script and blocked-script reading, all-pattern print visibility, 1440/390/320 px layouts, paired mobile reading order, 200% text with spacing overrides, blocked fonts, forced colors, reduced motion, contrast, no storage or outbound submissions, and guarded card entry. Existing browser suites change only obsolete availability and link-count assertions.

The handoff report records the final commit, exact executed results, actual screenshots, print exports, visual comparison and environment limits. Test definitions alone are not evidence of a pass. Automated accessibility checks and an accessibility-tree snapshot do not establish screen-reader comprehension or WCAG conformance. NVDA/Firefox, VoiceOver/Safari, physical-device touch/system-font review, native browser-toolbar 400% zoom and a physical printer remain manual checks unless separately recorded as performed. A 320 CSS px viewport is reflow evidence, not a claim that native 400% zoom was exercised.

No existing PR, Product Vision, server, Nginx configuration, development staging or production deployment is changed by this work. Founder review and separate staging authorization remain distinct from this implementation candidate.
