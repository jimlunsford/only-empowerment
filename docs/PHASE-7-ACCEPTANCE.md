# Phase 7: Do It Now acceptance

Status: accepted and closed. PR #9 is merged; product and dedicated deployed staging acceptance are complete. Development version remains `0.1.0-dev.7`. Production has not launched.

## Historical candidate and correction record

The candidate gates, pending statements, draft/unmerged instructions, counts and deployment pointers below record their original execution boundaries. They are preserved as history, not current status. The final acceptance section supersedes those status statements without changing the recorded evidence.

Baseline verified 2026-09-25: main and staging `5e44590d26122dc368655c9554bdd0b08faac667`, version `0.1.0-dev.6`, successful required verify run `36127083306`. VPS hostname and immutable current release agree. Candidate development version is `0.1.0-dev.7` under the existing prerelease sequence.

Scope: shortest complete workflow for a known action, explicit readiness and Begin, optional memory-only timer, user-reported Completed/Partial/Blocked Action Record, editable review, copy/print, explicit save, six-type Saved Work, and reviewed Next Move handoff. Existing artifacts and statuses remain unchanged.

Live Pure Execution Mode and Core Frameworks reviewed on 2026-09-25. Execution follows a sufficiently understood action; the interface cannot infer completion or behavioral identity.

Required gates: full local browser matrix with zero retries, unit/format/type/build/audit checks, visual review, exact-head required CI, independently compared CI artifact, source-pinned immutable deployment envelope. Stop before privileged deployment for owner sudo. PR remains draft and unmerged. Production and final v1 launch work are out of scope.

## Implemented scope

Do It Now has four working screens and an artifact exit, explicit Started state, Completed/Partial/Blocked reports, editable review, copy/fallback/print, an optional off-by-default 1-to-60-minute in-memory timer, explicit Action Record saving and the reviewed Next Move transfer. Six-type Saved Work preserves old schemas and statuses. The global quota, scoped deletion, stale-byte rejection and tab synchronization remain shared.

## Verification record

99 unit tests passed with zero failures. The complete local browser matrix passed 436 checks with 12 staging-only skips and zero retries across Chromium, mobile Chromium, Firefox and WebKit. A test-only style-injection issue was corrected to use the established enlargement method without changing CSP. Local Firefox requires its content sandbox disabled inside the already sandboxed execution container; this is a test-environment setting only, absent from the product and repository browser configuration. Required CI runs its normal four projects with zero retries.

Deployed-candidate recovery later exposed a same-document synchronization race: the tab that deleted an Action Record could receive its own delayed BroadcastChannel event through a second channel object and clear immediate fresh work. The corrected candidate gives each page instance an ephemeral sender ID, ignores only its own channel messages, accepts legacy messages without sender metadata as external, and preserves storage-event, visibility-recheck and cross-tab behavior. Focused coverage now protects same-tab single-delete and delete-all fresh work, legacy messages and the existing cross-tab paths. Final corrected-candidate counts and hashes belong to the packaging verification report after exact-head CI.

Full final browser matrix, exact-head CI, strict build and artifact comparison are required before packaging. The packaging verification report supplies exact final SHA, CI run/artifact IDs, archive/envelope hashes, test counts and deployment command, which cannot be embedded in their own source commit. No provisional run counts constitute deployed acceptance.

Visual review includes direct entry/begin, timer, all three results and artifact reviews, mobile artifact, handoff preview/replacement, six-artifact Saved Work, 320px/200% reflow and print. The implementation keeps the established restrained visual system and does not introduce a planner, Pomodoro cycle, motivation score or onward engagement loop.

Limits: no actual NVDA, JAWS, VoiceOver, TalkBack, physical-device keyboard or physical-printer checks were available. Axe, keyboard and emulated media/reflow checks are evidence, not WCAG certification. No deployed Phase 7 acceptance is performed in this execution.

## Immutable deployment boundary

`ops/deploy-do-it-now-candidate.py` uses the established source-pinned foundation helper and existing VPS-wide backup/restore calls. The expected pre-switch release and transactional rollback pointer are `/var/www/dev.onlyempowerment.com/releases/85b995de7522149b50e76737af66a6f9cdc991d4`. Accepted main remains `5e44590d26122dc368655c9554bdd0b08faac667`. Nginx hash remains `1af84bfffe4e3d4aafd4fc3b07147da1663b2f9c2d47b4e12534be7dbc5b683a`. Public files are immutable; the current pointer changes atomically and rolls back on verification failure. Root-only foundation helper readback remains an owner-sudo preflight assertion. No configuration or privilege-policy change is used to obtain access.

Stop before sudo. PR #9 remains draft and unmerged. Production is untouched.

## Route-focus correction (2026-09-26)

Passive diagnostic run `36253333900` recorded a delayed route-heading focus effect taking focus from the task textarea during WebKit fill. The fill returned successfully without a task input event or Action Session task update. No populated-to-empty fresh session transition occurred; self-originated deletion replay was ignored correctly. The older first-action disappearance remains unexplained and is not attributed to this correction.

The route title, heading focus and scroll reset now use Preact's post-DOM layout effect. This retains the existing initial-load policy and heading accessibility while completing route focus in the commit before new-page interaction. No synchronization or Do It Now semantics change. New browser coverage checks normal hash navigation, heading focus/title/tabindex, and uninterrupted immediate form input with retained focus and state. The original deletion replay regression is unchanged.

Required correction gates are focused Chromium/WebKit checks, 50 WebKit repetitions each of the original replay and new immediate-interaction tests, zero retries, then full exact-head verification and independent artifact comparison. Final measured counts and candidate provenance belong to the external packaging report. Deployment still stops for owner sudo.

## Screenshot-evidence infrastructure correction (2026-09-26)

Accepted application candidate `a7e8ec325703856542aa29236776be6351604b33` preserves screenshot degradation evidence without blocking subsequent product assertions for the recognized screenshot capture infrastructure failure. A distinctly named viewport fallback, capture-evidence JSON, attachment and annotation record degradation; unexpected errors remain fatal. This did not introduce test retries or weaken product assertions. See TESTING.md for the capture contract.

## Staging timeout and workflow-only correction (2026-09-26)

The first staging verification attempt timed out within the workflow job budget. This was a verification-infrastructure limit, not a completed application acceptance result. Commit `b3a9b45965c318312360b9bb8385dadc8f784dd5` changed only `.github/workflows/ci.yml`: the job budget increased from 15 to 35 minutes, an explicit `staging_commit` input pins the expected deployed SHA, and the staging artifact name uses that pin. Application bytes were not redeployed to match the workflow head.

## Final Phase 7 acceptance (2026-09-26)

- Accepted deployed application: `a7e8ec325703856542aa29236776be6351604b33`.
- Workflow-only verification head: `b3a9b45965c318312360b9bb8385dadc8f784dd5`.
- [Final workflow run 36268773707](https://github.com/jimlunsford/only-empowerment/actions/runs/36268773707): completed successfully; **Verify deployed staging: success**.
- Configured retries: **0**.

| Dedicated deployed project | Passed | Skipped | Failed |
| --- | ---: | ---: | ---: |
| Chromium | 117 | 0 | 0 |
| Mobile Chromium | 117 | 0 | 0 |
| Firefox | 117 | 0 | 0 |
| WebKit | 117 | 0 | 0 |
| Total | 468 | 0 | 0 |

Ordinary browser verification in the same run: **456 passed / 12 staging-only skipped / 0 failed**.

Staging-review artifact:

- ID: `10915232808`.
- Name: `staging-review-a7e8ec325703856542aa29236776be6351604b33`.
- Digest: `sha256:378f4ed5bb93a5c08561ef145f074ca74c5cc9e377db33c78d9953a0f36d683c`.
- Artifact retention is seven days; these recorded results remain the durable acceptance summary after expiry.

[PR #9](https://github.com/jimlunsford/only-empowerment/pull/9) was marked ready, merged and closed using a **merge commit**. Previous main `5e44590d26122dc368655c9554bdd0b08faac667` and feature head `b3a9b45965c318312360b9bb8385dadc8f784dd5` are the parents of accepted Phase 7 main `0df2c7d3338abb18968ef0cca7c86f41455d6d2d`. Its tree exactly matches the feature head. Before merge the feature branch was eight commits ahead and zero behind main. Later documentation reconciliation does not change this application acceptance checkpoint.

**Staging normalization is not required.** The Phase 7 accepted main differs from the deployed application only in `.github/workflows/ci.yml`. Staging `build.json` should continue identifying `a7e8ec325703856542aa29236776be6351604b33`; no redeployment or metadata relabeling is needed solely to match the later repository SHA.

Phase 7 is fully closed. Production remains untouched. No Phase 7 tag or GitHub Release exists. Whole-product production readiness is not claimed. Actual screen-reader, physical-device keyboard and physical-printer checks remain unverified as listed above; automated accessibility evidence is not WCAG certification.
