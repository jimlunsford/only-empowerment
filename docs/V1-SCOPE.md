# v1 scope and first reference tool

## Included in intended v1

The six tool responsibilities in TOOL-CATALOG.md; concise attributed lessons; deliberate user-owned choices; portable text outputs; copy and browser print; memory-first operation; optional explicit local save with deletion; reviewed tool handoffs; accessible mobile workflows; honest privacy/source page; traceable versioned static releases.

Tools ship only when their own workflow and output acceptance criteria pass. A broad family definition is not permission to finish every tool in one execution.

## Excluded

Accounts, cloud sync, server response storage, AI APIs, diagnostics, psychological scoring, social/community features, coaching marketplace, payments, subscriptions, commerce, article publishing, remote form processors, advertising, streaks, badges, notifications, automatic recommendations, server PDF generation, and a generic workflow builder. Structured import/export and PWA installation/offline update handling are deferred enhancements, not v1 blockers unless explicitly promoted in a later scope decision.

Minimal production analytics are allowed under the [Analytics policy](ANALYTICS-POLICY.md), with Google Analytics selected and implementation requiring explicit review. Behavioral advertising, session replay, heatmaps, user profiling, and collection of authored tool content remain out of scope. Current staging remains analytics-free.

## Historical phase boundaries

The Phase 1 through Phase 6 sections below preserve scope and candidate status at those times, not current availability. All six core tools are now implemented and accepted; see the Phase 7 section and [final acceptance](PHASE-7-ACCEPTANCE.md).

## Phase 1 boundary

Repository, documentation, architecture decision, tool outlines, visual direction, honest privacy page, small interaction preview, test/build/CI foundations, version/source metadata, and staging if operationally achievable. No complete Decision Room, Next Move, Reset, Build a Standard, Rebuild Map, or Do It Now. No apex cutover or public production release.

## Reference recommendation: Next Move

| Capability | Next Move | Decision Room |
| --- | --- | --- |
| Lesson + reflection | Clear execution distinction in a short flow | Rich values instruction, more editorial work |
| State and validation | Enough stages and revision paths to prove the pattern | More branching/options before basic conventions settle |
| Output | Compact, independently usable Execution Card | More complex multi-option Decision Record |
| Local save/delete | Representative draft and final artifact | Same foundations plus larger state |
| Print/copy | Easy to evaluate a complete card on phone and paper | Useful stress case later |
| Handoff | Can consume selected decision/map context and offer an optional action continuation | Naturally hands off to Next Move, which would still be unbuilt |
| Accessibility/mobile | Full meaningful journey with manageable cognitive load | Higher complexity obscures foundation issues |

Next Move tests the common system with less product ambiguity. Decision Room should follow to test richer options, tradeoffs, and PERIOD lenses after shared patterns have evidence behind them.

## Phase 2, not started

1. Write and review Next Move's actual lesson/question/output script against the live execution source.
2. Implement complete typed state transitions, backward revision, honest exit behavior, completion boundary, and Execution Card mapping.
3. Add explicit local draft/artifact saving, schema validation, storage failures, per-record delete, Delete my local data, and multi-tab deletion tests before offering persistence.
4. Add copy/print/output polish, mobile/keyboard/screen-reader checks, privacy marker tests, and a reviewed handoff contract without pretending unbuilt tools are usable.
5. Resolve license approval and remaining staging operational gates; accept the reference workflow through a PR. Do not infer production launch authorization.

## Phase 2 candidate status

Next Move is the only tool implemented in this candidate: six-step clarification, pause, editable review, Planned Execution Card, copy/print, explicit local artifact saving, saved work, and deletion. The remaining five tools retain outlines only. Phase 1 is closed. Product acceptance and staged verification are tracked in PHASE-2-ACCEPTANCE.md; implementation does not imply owner approval or a production launch.


## Phase 3 Decision Room candidate

Next Move is accepted on main. Phase 3 implements Decision Room as the second complete candidate and its finite handoff into Next Move. Reset, Build a Standard, Rebuild Map and Do It Now remain outlines. Candidate implementation does not mean product acceptance.

## Historical Phase 4 scope

Build a Standard is the third candidate following accepted Decision Room and Next Move. Personal Standard, seven-stage teaching workflow, editable artifact review, copy/print, explicit local save and three-type Saved Work are in scope. Reset, Rebuild Map and Do It Now remain unbuilt. No generic import/handoff system, standard adherence tracking, account, scoring or recommendations. Candidate completion is not owner acceptance.


## Historical Phase 5 scope

Reset is the only new tool in this phase. It includes seven authored answers, manual or explicitly selected saved standard, validity check and legitimate pauses, editable Planned Reset Plan, copy/print, explicit local artifact save and four-type Saved Work. No diagnosis, scoring, AI, streaks, miss history, punishment prescription, incident therapy, automatic handoff, production release, Rebuild Map or Do It Now implementation. The three accepted tools retain their contracts. Candidate implementation does not imply product approval.

## Historical Phase 6 boundary

Rebuild Map is the current candidate, extending four accepted tools. Scope includes standalone Mapped artifact, deliberate Personal Standard reference, five-type Saved Work and same-tab Next Move handoff. No life-planning dashboard, proof tracker, identity assessment, gamification, Do It Now implementation or production launch. Keep the feature PR draft and unmerged for explicit product review.


## Current Phase 7 accepted scope

Do It Now is the only new tool. Four working screens, explicit Begin, optional bounded timer, truthful user-selected result, editable Action Record, copy/print, explicit local saving, six-type Saved Work and the existing Next Move handoff contract. PR #9 is merged and closed. All six planned core tools are accepted into main at the Phase 7 checkpoint `0df2c7d3338abb18968ef0cca7c86f41455d6d2d`, version `0.1.0-dev.7`. Deployed staging acceptance is complete; this does not establish whole-product production readiness. No production deployment, final v1 launch, dashboard, diagnosis, streaks, AI, analytics or additional cross-tool transfers.
