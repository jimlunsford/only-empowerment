# Phase 6 Rebuild Map candidate

Status: implementation in progress. Not approved for merge.

Verified 2026-09-24: public repository, accepted main `396a7ea49a41fcc61fb3a0ab0402acad74a9dff1`, application `0.1.0-dev.5`, successful Product verification run 35747987083, required `verify` check. Staging build.json and immutable release path identify that same clean accepted source. Historical Reset candidate notes predate its merge and are not current acceptance state.

Build Rebuild Map at `0.1.0-dev.6` on `feature/rebuild-map-v1`. Keep the PR draft and unmerged for explicit product review. Preserve all four accepted tools, privacy architecture, local data semantics, and Decision Room handoff. Use standalone Status: Mapped. No Do It Now, production launch, tags, releases, or infrastructure policy changes.

Accepted deployed verification uses a separate Playwright staging configuration and a conditional step in Product verification. There is no separate deployed-verification workflow on inspected main. Preserve this architecture unless a concrete implementation issue requires a documented change.

Deployment is authorized to staging only. The VPS is connected as jim; sudo currently requires owner authentication. Prepare the exact verified CI payload and pinned deployment helper before that owner step. No credentials or privilege changes.

Pending: implementation, regression checks, full required CI, exact candidate staging deployment, deployed verification, visual review, backup/rollback evidence, and owner product review. No pending gate is claimed as passed.
