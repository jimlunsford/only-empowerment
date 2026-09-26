# Phase 7: Do It Now candidate

Status: implemented candidate; owner product and deployed acceptance remain pending.

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

`ops/deploy-do-it-now-candidate.py` uses the established source-pinned foundation helper and existing VPS-wide backup/restore calls. Rollback is `/var/www/dev.onlyempowerment.com/releases/5e44590d26122dc368655c9554bdd0b08faac667`. Nginx hash remains `1af84bfffe4e3d4aafd4fc3b07147da1663b2f9c2d47b4e12534be7dbc5b683a`. Public files are immutable; the current pointer changes atomically and rolls back on verification failure. Root-only foundation helper readback remains an owner-sudo preflight assertion. No configuration or privilege-policy change is used to obtain access.

Stop before sudo. PR #9 remains draft and unmerged. Production is untouched.
