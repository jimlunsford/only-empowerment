# Shared workflow model

Lesson → reflection → decision → action → result.

This is a conceptual model, not a requirement for five screens. A very short tool can combine adjacent stages. A complex decision can contain several reflections. Every step must earn its place by improving the user's next answer or action.

| Stage | Responsibility | Exit condition |
| --- | --- | --- |
| Lesson | Teach the distinction needed now | User has context and can continue without a quiz |
| Reflection | Surface facts, boundaries, and uncertainty | User has supplied enough of their own context |
| Decision | Record a deliberate choice | User makes or explicitly defers the choice |
| Action | Make the choice executable | User defines behavior and a completion condition |
| Result | Separate intention from evidence | User records what actually happened, including a miss |

## Shared components, deliberate limits

Phase 1: App shell, route handling, PageIntro, Lesson, SourceNote, tool catalog, preview progress, labeled response, associated error, sample output, copy status, clear confirmation, and print stylesheet.

Future primitives: short/long response, choice, multi-choice, optional reflection, confirmation, output section, local-save control, reset, handoff review. Build each when a reference workflow needs it. Do not add a generic form-builder DSL, global rules engine, arbitrary expression evaluator, or server-managed schemas.

Tool state should use explicit typed transitions, owned by the tool. Components own presentation. A pure output mapper converts validated state into an OutputArtifact. Validation asks whether required information exists, not whether a person has good values. The app cannot compute the correct life choice.

## Navigation

Current hash routes contain only allowlisted route identifiers. Never encode answers in hashes, paths, query strings, document titles, logs, analytics, or links. Back navigation inside a real workflow preserves the draft. Exiting an unsaved future workflow should explain loss and offer keep working, discard, or explicit local save when available. The Phase 1 preview clearly says leaving discards its in-memory response.

## Handoff contract

A handoff contains source tool, target tool, and selected labeled fields in memory. Before transfer, show what will move; the user can edit, exclude, or cancel. The target remains responsible for its own questions and validation. Do not overwrite an existing draft silently. Never append private text to a URL. No automatic chain, forced continuation, or loop back into engagement.

The Phase 1 Handoff type reserves a boundary only. Transfer behavior is not implemented. The first reference tool must test a finite handoff preview without falsely opening an unfinished receiving tool.

## Next Move implementation

Six steps: situation; user-owned action; readiness choice; obstacle and its effect; start condition; completion boundary. Each has a concise lesson. Then editable review and an explicitly Planned card. Readiness and blocker branches allow a clean pause; Decision Room is identified as future/unavailable. Navigation inside the app retains a single typed Next Move session in App, without persistent draft storage or a global state library. The preview retains its disposable behavior.

Proven shared pieces: FieldInput with bounds/instructions/errors, ConfirmDialog using native modal semantics, LocalNotice, ExecutionCard, LocalDataControls and the artifact storage service. This is not a generic workflow DSL. `handoffPreview` is a pure typed contract for an optional future Do It Now transfer with selected fields and Planned status. Tests cover selection/exclusion; no unavailable receiving tool is presented as usable. A live handoff review is deferred until there is a real receiver, as allowed by the Phase 2 kickoff.


## Phase 3 Decision Room candidate

Decision Room follows definition, alternatives, direction, six lenses, practical reality, uncertainty, readiness, explicit choice, rationale/first move and editable confirmation. Its optional handoff into Next Move is now real: review/edit/exclude two fields in memory, protect existing work, then run the full receiving workflow. See DECISION-ROOM.md.

## Phase 4 Build a Standard

Seven stages group context, line, reason, paired behavior lists, structure, paired adaptation/non-negotiation, and correction. Artifact-shaped review offers inline section edits before “Set this standard.” Confirmation remains editable. The resulting Personal Standard stands alone; there is no unavailable continuation or automatic Next Move prefill. Typed tool state and small list interaction remain local to this implementation, with no generic form engine. Shared text controls, confirmation, storage notices, printing and Saved Work are reused.


## Phase 5 Reset

Seven stages: miss; standard source plus still-stands check; ownership; repairable weak point; immediate correction; supporting structure; next proof. Standard selection and validity share one stage to avoid a long incident review. Only an explicitly still-valid line continues. An unclear, review-needed or uncertain line pauses to Build a Standard without an artifact. Internal route navigation keeps Reset in app memory; reload/close can lose unsaved work. Artifact-shaped review exposes all seven fields. Every edit to the standard statement, including whitespace, invalidates its prior confirmation and returns to the standard check. Confirmation is “Confirm Reset Plan”; it only sets Planned. No cross-tool engine or private URL payload is introduced.

## Phase 6 Rebuild Map

Seven working stages plus editable artifact review: area/reality, standard, structure, repeated actions, proof, self-trust/negotiation, first move. A no-standard choice pauses toward Build a Standard without a map. The optional Rebuild Map → Next Move continuation uses the same App-owned in-memory preview/transfer pattern as Decision Room, with minimum Situation and Action text, independent exclusion/editing, and deliberate replacement protection. Next Move still runs its full workflow. No generic workflow engine or new transport. Details in REBUILD-MAP.md.


## Phase 7 execution workflow

Do It Now combines task/first action, readiness/Begin, result/evidence and artifact-shaped review into four screens. Begin only reports Started. An explicit Completed/Partial/Blocked report plus evidence is required before confirmation. Timer expiry is never a transition to completion. Next Move now activates its existing in-memory action/start/completion contract through editable preview, optional reference exclusion and replacement confirmation. No new transport or generic engine. DO-IT-NOW.md defines the finite transitions and boundaries.
