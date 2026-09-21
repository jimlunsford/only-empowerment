# Decision Room implementation contract

Decision Room asks which direction the user is choosing and why. Next Move asks what they are doing next. The implementation contains no scoring, weighting, ranking, automatic winner, recommendation, or semantic analysis of answers.

## Workflow and pacing

The opening names the choice, then defines two to four real alternatives and what matters. A decision statement must leave room to compare; purpose supplies direction without demanding a life mission. Waiting is never inserted automatically. Option IDs are stable local UUIDs so editing labels cannot accidentally select another option. Removing a populated option asks first and removes only its own tradeoff data. It clears the chosen ID if necessary and reminds the user to revise references in their reflections. No drag-and-drop or automatic ordering exists.

The comparison moves through six distinct, short PERIOD lenses, one reflection per lens across the alternatives. The decision, option names, and intended direction stay available beside each lens, stacked on mobile. A collapsible comparison lets the user manage long context without a wide table. The lenses do not require 24 separate reflections or numeric ratings.

Practical reality is explicitly separate from PERIOD. Each option has a tradeoff note and a user-selected reversibility description: Easy to reverse, Costly to reverse, Effectively irreversible, or Not yet known. Cost, consequences, risk, time and prerequisites belong in the note. Reversibility does not confer preference.

Uncertainty is required as a reflection, not certainty as a conclusion. The user may write that something is unknown or that no uncertainty is apparent. The application cannot classify that answer. The readiness step has eight choices, with no preselection: ready, information, guidance, prerequisite, safety, unclear options, changed circumstances, or not ready. Every non-ready choice leads to an undecided pause with no finalized artifact. The user can leave, revisit readiness, or revise the options. Prior saved records are not silently deleted by pausing.

Ready users see the same neutrally styled options in the same order and explicitly select one. They write their rationale and a concise first move. The first move has no start, obstacle, or completion planning in Decision Room. Review exposes every artifact field for editing, including options, practical notes, uncertainty and choice. Confirmation yields Decided, which means only that the user chose. It does not mean correct, completed, successful, or proven. The record remains editable; edits to a saved record need an explicit save.

## Framework fidelity and source governance

Live canonical sources reviewed 2026-09-21: [The PERIOD Code](https://jimlunsford.com/period-code/) and [Core Frameworks](https://jimlunsford.com/core-frameworks/). `src/decision-room-lessons.ts` contains concise adaptations, framework, canonical URL, contextual source URL, review date, tool, question and reviewer. Review attribution is Codex implementation review, with Jim Lunsford product approval pending. No full article is copied into the repository.

| Value | Lesson purpose and practical question | Misuse prevented |
| --- | --- | --- |
| Ownership | Separate the user's decisions and behavior from external outcomes. What is theirs to decide or do, and what belongs to someone else? | Responsibility is not blame for everything; influence is not control. |
| Purpose | Compare the direction each option serves against what matters. | No grand mission requirement or assumption that immediate relief is the right direction. |
| Resilience | Examine durability under pressure and where options are fragile. | Limits and support remain legitimate; harder is not inherently better. |
| Integrity | Examine behavior against claimed standards and competing commitments. | No purity test, perfection, shame or moral grade. |
| Discipline | Examine repeated behavior and supporting structure. | Effort and intensity are not preference signals. |
| Empowerment | Examine useful capability, support and appropriate responsibility for oneself and others. | Support, expertise and interdependence remain legitimate; avoid rescue and control. |

## Artifact and bounds

Decision Record fields, in order: Decision; Options considered; What matters; Ownership; Purpose; Resilience; Integrity; Discipline; Empowerment; Practical tradeoffs (each named option, note and reversibility); Uncertainty; Chosen option; Why I chose it; First move; Status: Decided.

Copy produces these labels and the user's exact text, headed ONLY EMPOWERMENT / Decision Record. It excludes interface controls and lesson paragraphs. Clipboard denial exposes a focused, selected, read-only plain-text textarea. Print reuses the reference artifact surface, suppresses shell/banner/controls, and flows across pages with wrapping, sensible heading breaks and readable monochrome type. Browser Save as PDF is sufficient; tagged accessible PDFs are not claimed. Attribution stays secondary: Based on The PERIOD Code; Built by Jim Lunsford, with canonical jimlunsford.com links on screen.

Most reflections allow 2,000 UTF-16 code units, first move 1,000, option labels 300, per-option tradeoffs 2,000. Two to four options bound comparison complexity. The largest finalized content is roughly 30,200 code units plus structure. The 200,000-character serialized ceiling allows worst-case JSON escaping. Bounds are communicated with usage counts, validated without truncation, and permit substantial multi-page records. Native textarea newline normalization is the only browser-level change; there is no rewriting, summarizing, linkification or HTML interpretation.

## Local storage

`oe:decision-record:v1:<local-uuid-v4>` stores `{schemaVersion:1,id,tool:'decision-room',status:'Decided',decision:{decision,matters,ownership,purpose,resilience,integrity,discipline,empowerment,uncertainty,rationale,firstMove,options:[{id,label,tradeoff,reversibility}],chosenId}}`.

No timestamps, analytics, hidden scores, readiness history, abandoned answers, draft snapshots or handoff payload are stored. IDs exist only to identify local records and options. Writes require confirmation and exact readback. Shape, version, bounds, option count, unique IDs, choice membership, status and key-ID agreement are validated. Unknown/corrupt records remain untouched and visibly counted.

The existing **global 50 app-record maximum** remains global across both types and unknown `oe:` records. This prevents surprising per-tool quotas and avoids a migration. `local-cards.ts` retains the original Execution Card schema, namespace, validation and bytes. `local-decisions.ts` adds the Decision Record parser and a union reader. Shared Saved Work identifies each artifact type and supports both. Opening a record asks before replacing meaningful work in its receiving tool only.

Per-record deletion verifies removal and clears open copies. Delete my local data removes all `oe:` versions, leaves unrelated keys, and clears both in-memory tools and the preview. Storage events and `oe:local-data` BroadcastChannel synchronize deletion; visibility checks catch suspended tabs. The existing limitation remains: without BroadcastChannel, deleting an entirely memory-only session with no storage key cannot notify another tab through storage events. Quota, denied storage, unverifiable readback and stale edits produce honest failures; memory remains usable for copy/print. Concurrent explicit writes can still race because localStorage is not a transactional database.

## Handoff

After confirmation only, the user may open a transfer review. Exact default fields are Decision → Next Move situation and First move → Next Move action. No rationale, PERIOD reflections, options, IDs, or uncertainty are transferred. Each field can be edited or excluded. Cancel returns to the record. Leaving the transfer route discards the transient preview; returning restores the record and allows a fresh preview.

Continue uses App-owned in-memory state and a fixed allowlisted hash route. It never puts text in a URL, title, external link, network request or automatic storage write. A meaningful existing Next Move session (any card content, readiness, or obstacle classification) requires deliberate replacement confirmation. Cancellation preserves it. Saved cards are never modified by transfer. The receiving session starts at situation, identifies its origin and allows edits. Readiness, obstacle classification, start condition, completion boundary and review remain mandatory Next Move behavior. Excluded fields remain blank and subject to normal validation.

## Architecture and privacy

The shared TextResponse component extracts only the already-proven labeled input, hint, bound and error behavior. FieldInput stays as the Next Move wrapper, preserving its IDs and labels. Dialogs, privacy notices, work surfaces and print conventions are shared. Decision Room retains specific typed state and validation, without a form DSL, workflow engine or generic decision algorithm. No dependency was added or upgraded.

Memory is default. Runtime remains static Preact, with no accounts, AI, analytics, request API, answer submission, remote runtime assets, cloud sync, PWA, or server PDF service. Existing CSP retains `connect-src 'none'` and `form-action 'none'`. Framework-rendered text remains escaped. Clipboard, printing, browser restoration, extensions, device backups and host compromise remain outside the application's deletion guarantees.

## Acceptance evidence

See PHASE-3-ACCEPTANCE.md for exact source, test results, staged artifact provenance, backup and review state. This contract describes implemented behavior, not a substitute for verification evidence or owner approval.
