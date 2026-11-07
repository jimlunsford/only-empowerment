# Work 35: Author's voice implementation

The six PERIOD lessons and examples now use the 177 founder-approved Work 34 replacements. The source is Product Vision v0.69 and the complete Work 34 editorial package, approved November 7, 2026. O01 uses the founder's corrected wording, including “your choices, their consequences” and “You may not have caused the situation.” The superseded damage wording is not used.

This branch starts directly from Work 33 commit `218ead21259b44075935b3ba74cdfc34a8bc2414` and targets `work/33-homepage-first-five-minutes`. It is priority two of four. It does not authorize merge or deployment.

| Value | Approved records |
| --- | ---: |
| Ownership | 34 |
| Purpose | 28 |
| Resilience | 29 |
| Integrity | 21 |
| Discipline | 36 |
| Empowerment | 29 |
| Total | 177 |

## Reconciliation and preservation

`tests/fixtures/work35-editorial.json` preserves each record's field, original wording, approved replacement and source files. Every original was checked at its owning field before any application source was written. D22 and D23 resolve separately. P28, I21 and D36 update both component and static-generator headings, including both Purpose component occurrences.

The exact-copy suite resolves fields structurally and verifies the approved string. It then reverses only those replacements and compares each complete, formatting-normalized source file with its baseline SHA-256. This guards all unlisted text, scenario facts, array lengths, paragraph positions and surrounding implementation. Earlier independent content digests remain in the existing tests, with only the approved Work 35 fields restored before comparison.

P20's `purposeCopy.readingLead` previously appeared only in the interactive complete-text alternative. The static Purpose generator now includes that approved paragraph once, while retaining its existing JavaScript disclosure and all other material. This is the only added rendering expression. The exact-copy suite explicitly accounts for it before checking the unchanged baseline.

Static parity checks cover 167 exact records. Ten Discipline pair-specific records (D15, D16, D19, D20, D22, D23, D25, D26, D32, D33) have the existing complete three-pattern equivalents D13, D18, D21, D24 and D31. Both pairwise variants remain in the interactive comparison; the complete reading and print retain all three patterns across all seven occasions.

The four Ownership views, four Purpose plans, five Resilience pressures, three Integrity annotations, seven Discipline occasions and three Empowerment replies retain their original mechanics. Responsibility without false blame, hard versus harmful, necessary rest and care, privacy, consent, accommodations and ongoing assistance remain protected. The optional Standard Card still records an intention. Its builder, copying, printing, drafts and navigation safeguards are unchanged.

The accepted homepage files, routes, storage, privacy, source licensing, footer, retirement boundary, dependency files and CI configuration are unchanged. No Product Vision edit, existing PR modification, main change, merge, deployment, server change or actual visitor-data operation is part of this work.

## Verification and inherited limits

The Work 35 exact-copy and static-parity suite adds 17 checks to the 76 existing unit checks. The existing browser suites exercise the lesson text, alternative states, keyboard and focus behavior, axe checks, 1440/390/320 widths, privacy, Standard Card, retired routes and print. The final handoff records executed outcomes, exact commit, screenshots, A4/Letter exports and checksums.

Work 33's intermittent WebKit native-anchor refresh failure with application scripts blocked remains unresolved. A separate mobile Chromium popup `bringToFront()` timeout was also documented in the parent investigation. Original assertions, timeouts, zero-retry configuration and planned skips remain unchanged. A passing sample does not correct either inherited limitation. No speculative repair is included here.

Physical-device and native screen-reader verification require separate evidence and are not established by browser emulation or axe.
