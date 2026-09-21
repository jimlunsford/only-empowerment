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
