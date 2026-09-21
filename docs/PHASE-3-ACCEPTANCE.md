# Decision Room candidate

Status: implementation in progress. Not accepted, merged, or deployed.

Accepted base inspected: `26ff9be784ce2395413b19be441dd418b0e6ab77`, version `0.1.0-dev.2`. Trusted staging build metadata matches this base. Latest main verification run 35596673509 passed. Feature branch: `feature/decision-room-v1`; target version `0.1.0-dev.3`.

## Product decisions

- Two to four user-authored options, no automatic wait option, sorting, weights, scores, ranking, or recommendations.
- Define decision and direction; compare with six distinct PERIOD reflections; examine per-option tradeoffs and reversibility; retain uncertainty; check readiness; explicitly choose; explain rationale and first move; edit review; confirm a Decided Decision Record.
- Pausing creates no finalized artifact. All in-progress work remains in memory.
- Preserve the existing global maximum of 50 `oe:` records, including unsupported records, across both artifact types. No migration of Execution Cards.
- Explicit editable/excludable in-memory handoff into Next Move, with deliberate replacement confirmation when existing Next Move work is meaningful. No bypass of Next Move validation.
- Keep the approved general staging banner unchanged. It remains truthful about Next Move being the reference tool and staging not being a production release. Decision Room availability is identified in the tool catalog and workflow.
- Re-reviewed live PERIOD Code and Core Frameworks on 2026-09-21. Lessons will carry canonical source metadata beside implementation.

## Gates

Draft PR must remain unmerged. Local, CI, deployed, accessibility, privacy, visual, print, source-to-artifact and backup evidence remain pending. Production and other tools are out of scope. VPS connection was offline at inspection; verify hostname and live deployment state after reconnection.
