# Work 28: retire public legacy tools

Authority: founder's November 6, 2026 assignment and Product Vision v0.56. Exact base: `f15c1ea0b5c8748312b7cac30947a99d7a1f5046`, unchanged draft PR #26. This candidate targets `work/26-visual-cohesion-footer`. It authorizes source publication and a draft PR, not deployment.

## Public behavior

All six legacy tools, their catalog, Saved work and Approach have no handlers or executable implementation in the public application. Old fragments reach the unavailable page with educational links. There is no hidden tool route, authenticated host, or server-side fragment rule. The build rejects every retired module name in a generated chunk. Clean builds remove stale generated assets; the deployment recommendation below must also prevent old release assets being served.

The six complete lessons, all six interactions, approved teaching text and reading routes remain. PERIOD content, lesson components, interaction state models and the Standard Card implementation are unchanged from the base. The shared field and confirmation-dialog implementations remain byte-identical after removing their legacy-only siblings. Footer Existing work is removed in both application and static generators. Exact founder/LLC wording and links, AGPL permissions, corresponding source and no warranty remain separate and intact.

## Existing browser data

Removing `useLocalWork` removes startup reads, record parsing, six tool sessions, storage event listeners and the old broadcast channel from the public application. No runtime code writes local storage. No mount or navigation path accesses it. Fictional fixtures represent all six old schemas plus empty, malformed, unsupported and unrelated keys. Browser tests compare exact raw strings and SHA-256 hashes across direct loading, reload and navigation; tests also instrument storage access and deny it entirely.

The only remaining storage operation is confirmed deletion in Privacy & source. It enumerates keys, removes the historical `oe:` namespace, and verifies absence by re-enumerating keys. It never reads record values or calls unscoped `clear()`. Cancellation accesses no storage. Denied, partial or ineffective deletion reports uncertainty, never false success. The namespace includes unsupported legacy versions, matching historical deletion scope. Unrelated keys and the memory-only Standard Card remain intact.

Visitors are told to close older tool tabs first because those tabs could write again. This version does not claim to clear memory in an older running application. Browser site-data settings provide a script-free removal alternative. Clipboard, prints, screenshots, backups, extensions and hosting logs are outside the control. Old records remain tied to their original origin (scheme, host and port); a new private/offline origin does not automatically recover them. No actual visitor records were accessed.

## Preserved baseline and verification

`docs/preservation/work28-baseline.json` lists SHA-256 digests for all 208 tracked baseline files and the Git tree identity. It includes all legacy source, original tests, lockfile, build scripts, documentation and workflow configuration. A unit check resolves every entry from Git and verifies exact bytes and ancestry. The full ancestor history remains unchanged, publicly readable on GitHub.

An offline preservation directory exists on the authorized Apollo workstation, outside any served application directory:

`/home/jim/Projects/only-empowerment-work28-20261106/preservation/`

It contains a complete self-contained Git bundle and source archive, plus original Work 26 production/staging artifacts. The handoff records independently verified checksums and completed archive readback. The original immutable staging and rollback releases have not been modified or removed.

Original Work 26 verification is preserved in [the existing verification package](https://chatgpt.com/library?file_id=libfile_d2a13e5ecd3881918800cca41a05a433&account_id=personal) and [CI run 42095583572](https://github.com/jimlunsford/only-empowerment/actions/runs/42095583572). That run passed 165 unit tests, 28 production checks, and 863 full browser checks with 17 intentional skips. Work 28 also reran the unchanged base's 165 unit tests and captured the original 880-case browser inventory. These are historical verification results, not claims that retired workflows pass on the new public app.

### Test retirement accounting

The six legacy unit files are removed from the active public suite: `next-move`, `decision-room`, `standard`, `reset`, `rebuild`, and `do-it-now`. They contained 94 passing baseline cases. The one ToolGrid-specific structural assertion is also retired. All original bytes remain in the preserved base. The 70 other unit cases remain, with relevant presentation/privacy/footer expectations updated to the new contract; four additional tests cover deletion failures, module boundaries and complete source preservation.

| Retired browser file | Original four-project cases |
| --- | ---: |
| decision-room.spec.ts | 48 |
| next-move.spec.ts | 40 |
| standard.spec.ts | 48 |
| reset.spec.ts | 76 |
| rebuild.spec.ts | 80 |
| do-it-now.spec.ts | 128 |
| Total retired tool cases | 420 |

The 32 navigation cases are retained under `navigation-public.spec.ts`, with reopening expectations replaced by retirement and storage-preservation expectations. Shared shell, focus, privacy, presentation and Unicode wrapping checks now use the retained Standard Card. The print test removes six retired artifact exports and retains all six educational lessons, the card and five script-free documents. The deployed-staging suite remains opt-in and is adapted for a future retirement deployment; it is not run against current staging by Work 28. No new retirement skips or expected failures are introduced. Six new browser tests run in each of four projects (24 cases). The active browser inventory is therefore 484 cases, subject to its existing 17 environment-specific skips.

The handoff records final formatting, TypeScript, unit, both presentation builds, applicable full browser checks, 1440/390/320 screenshots, A4/Letter print audit, exact source commit and CI. Real assistive technology, physical devices, toolbar zoom and physical printing are not inferred from automated checks.

## Separately authorized private/offline restoration

1. Verify preservation SHA-256 digests and `git bundle verify` in a local repository.
2. Clone the bundle into a new directory, check out the exact base commit, and verify all 208 manifest entries. The bundle has complete ancestors and does not depend on the public repository being reachable.
3. Use Node 24, the preserved lockfile and `npm ci`; run the baseline unit/browser/build checks. Alternatively inspect the checksum-verified original build artifacts without rebuilding.
4. For a separately approved private/offline demonstration, bind a static preview only to loopback in an isolated browser profile. Do not deploy an old build under a public document root or restore it to the public origin as a shortcut to recovering records.
5. A different origin has separate storage. Any later intentional data access or transfer needs its own user-directed plan and authorization. This assignment contains no export, migration or automatic import facility.

Source archival is preservation, not source secrecy. Old public GitHub commits remain readable.

## Separate staging recommendation and safe rollback

No deployment is authorized here. After founder review, separately pin the final approved source and exact CI staging artifact, verify its complete file manifest, and prepare a new immutable release. Validate server routing and denied paths read-only before considering a switch. Copy into a fresh directory, never overlay an old public asset tree. Retired code must not remain reachable under stale hashed asset URLs, alternate release URLs or source/archive directories. Hash fragments are handled entirely by the application. Any infrastructure change found necessary requires separate authorization.

The existing `f15c1ea0` staging release and immediate `8447ce46` rollback both contain usable legacy tools. **Reverting to either would re-expose the tools.** Preserve them for archival recovery but do not designate them a safe public rollback after retirement.

Before eventual cutover, prepare and verify an immutable retirement-only fallback artifact that passes the same no-legacy module, route, storage and reading checks. Initially the accepted Work 28 artifact can be the safe last-known-good rollback; later releases must retain it. If the first retirement release fails materially before any safe prior version exists, use a separately approved static educational/unavailable fallback rather than republishing legacy tools. No reverse data migration or clearing is needed. An already open old tab or a previously downloaded artifact cannot be remotely revoked by this source change; reload receives the new app after deployment.
