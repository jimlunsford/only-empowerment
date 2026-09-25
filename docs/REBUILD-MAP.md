# Rebuild Map

Phase 6 candidate. Rebuild Map helps the user design a sustained rebuild of one area. The user owns the standard, structure, repeated actions and proof. The tool does not prescribe a life direction, rewrite answers, certify identity, or track behavior.

## Doctrine review, 2026-09-24

Live sources were reviewed before lesson implementation. Pure Execution Mode was located through the actual Core Frameworks navigation, then read. Supporting articles were discovered from that same live navigation rather than invented slugs.

- [How to Rebuild Yourself](https://jimlunsford.com/how-to-rebuild-yourself/): the primary sequence is standard → structure → repeated action → proof → self-trust → identity → less negotiation → ownership of the life. Structure serves the chosen behavior and can include appropriate support. One first move begins implementation; a completed map is not proof.
- [Core Frameworks](https://jimlunsford.com/core-frameworks/): keep values, rebuild process, reinforcement, and execution distinct.
- [The PERIOD Code](https://jimlunsford.com/period-code/): the user owns the line and their part in carrying it out. Values are not inferred or scored.
- [The Discipline Loop](https://jimlunsford.com/discipline-loop/): repeated behavioral evidence supports self-trust and identity. Identity is taught as an effect of evidence, never collected as an affirmation or certified by the application.
- [Pure Execution Mode](https://jimlunsford.com/pure-execution-mode/): end with one executable move rather than requiring the whole rebuild immediately. Next Move remains responsible for readiness and its full workflow.
- [What Discipline Really Is](https://jimlunsford.com/what-discipline-really-is/): practical structure, correction, and repetition rather than intensity or punishment.
- [How to Rebuild Self-Trust in Recovery](https://jimlunsford.com/how-to-rebuild-self-trust-in-recovery/): behavioral reliability develops through kept commitments rather than speeches.
- [How to Rebuild Your Identity After Addiction](https://jimlunsford.com/how-to-rebuild-your-identity-after-addiction/): identity follows repeated evidence. The map does not ask the user to claim an identity or implement the article's suggested evidence tracking.

Seven concise original lesson adaptations live in `src/rebuild-lessons.ts`. The governed registry records key, framework, canonical source, additional source URLs, context source, reviewed date, tool, question, and reviewer. Full articles are not bundled. Product approval remains Jim's gate.

## Workflow and boundaries

| Stage | Authored work | Purpose |
| --- | --- | --- |
| Area and reality | One area; current facts | Establish scope without identity judgment or personal-history intake |
| Standard | Manual concise statement, explicit saved selection, or unclear-standard pause | Orient the rebuild without duplicating Build a Standard |
| Structure | Supporting conditions | Connect schedule, preparation, environment, boundaries, tools or support to the line |
| Repeated actions | One to five ordered actions | Define observable behavior without generated frequencies |
| Proof | Observable evidence that will count | Define evidence without tracking it or requiring numerical metrics |
| Self-trust and negotiation | Two separate behavioral answers | Connect reliability to reduced unnecessary debate; distinguish deliberate adaptation |
| First move | One executable action | Begin structure or repeated behavior |
| Review | Nine editable artifact sections | Confirm the user's map, not completed behavior |

Entry distinguishes Decision Room for unresolved direction and Reset for a specific miss. Build a Standard owns the full standard definition. The unclear-standard path pauses without a final map and links internally to Build a Standard. Navigation preserves the in-memory session in the current tab, with no promise across reload or closure. No Do It Now feature or handoff is introduced.

## Saved Personal Standard reference

Only valid local Personal Standards are offered. Nothing is selected automatically. The picker identifies area and statement; an expandable read-only reference shows area, statement, keeping behaviors and protecting structure. The selected source is re-read and validated before use. Other map answers are never inferred or filled from it.

Only the standard statement enters the final map. Reference content, selection key and source choice remain in memory. The saved map contains no source key and remains understandable after source editing or deletion. Editing the map's statement never changes its source. There is no Reset-style standing recheck because this workflow is designing a rebuild rather than responding to a miss.

## Artifact contract

`Rebuild Map`, Status: **Mapped**. This extends the accepted semantic distinction between Decided, Planned and Set. It describes the state of the artifact only. No action, proof, success, rebuilt identity or completed life change is implied. The historical generic `OutputArtifact` type is not used by accepted concrete artifacts and is not repurposed here.

Order: What I am rebuilding; Current reality; Standard I am raising to; Structure I am building; Actions I will repeat; Proof that will count; What I need to trust myself to do; Negotiation I am reducing; First move; Status.

Eight text answers permit 2,000 UTF-16 code units each. One to five repeated actions permit 1,000 each, matching Personal Standard list bounds. Empty or excessive content gets associated errors and focus; it is never truncated, rewritten, sorted or scored. User strings remain exact subject to native textarea newline normalization. Lists support add/edit/remove, removal confirmation, and focus restoration.

Copy begins `ONLY EMPOWERMENT` and `Rebuild Map`, then ordered labels and exact text separated by blank lines. Actions use `- ` prefixes. It ends `Status` / `Mapped`. Failed clipboard access exposes selected plain text. Browser print uses only the artifact, flowing text and small attribution through the accepted print styles. Unicode long-token rendering reuses the accepted grapheme-safe renderer.

## Persistence and deletion

Existing architecture, new namespace: `oe:rebuild-map:v1:<UUID-v4>`.

Exact JSON: `{schemaVersion:1,id,tool:"rebuild-map",status:"Mapped",map:{area,reality,standard,structure,actions,proof,trust,negotiation,firstMove}}`.

No timestamps, source identifiers, drafts, handoff contents, scores or history are saved. Explicit confirmed saving only; shared-device notice, exact readback verification, stable local record identity for explicit updates, stale-byte rejection. The 130,000-character serialized ceiling accommodates worst-case escaping at every field maximum. All five artifact types and unknown owned keys share the accepted 50-record limit. Existing schemas and bytes require no migration.

Saved Work opens, edits and deletes maps using the accepted replace-session confirmation pattern. Delete my local data clears every `oe:` key and every tool's current state, including map references and transient handoff previews. Storage events, BroadcastChannel deletion and visibility rechecks extend the accepted synchronization. Failures remain visible and preserve work where possible; simultaneous explicit writes retain the documented nontransactional storage limitation. Unrelated origin keys are preserved. External clipboard/PDF/print copies remain outside local deletion.

## Optional Next Move handoff

Offered only after confirmation. Preview includes exact area plus two newline characters plus current reality as Situation, and exact first move as Action. Each field can be edited or excluded independently, including both. No structure, repeated actions, proof, trust, negotiation, or source identifiers are transferred.

Each included value must fit Next Move's existing 2,000-character limit. A combined Situation may exceed that limit, in which case the whole original text stays visible for deliberate editing or exclusion. No automatic truncation or summarization.

Transfer uses the existing App-owned in-memory Next Move session model and fixed allowlisted route. No URL payload, server request, new transport or persistent draft. Existing meaningful Next Move work requires deliberate replacement confirmation; cancellation preserves it. Saved Execution Cards remain byte-for-byte unchanged. Next Move begins at Situation and still requires Action, readiness, obstacle/effect, start condition, completion boundary, review and Planned card confirmation. Leaving to act with the map alone is success.

## Verification and limits

Unit tests cover fields, list bounds, strict schema, authored copy, governance, worst-case serialization, five-type compatibility, snapshot independence, quotas/readback, stale writes, scoped deletion and minimal handoff. Browser tests cover main/paused/saved/manual flows, editing, list focus, copy/fallback, printing, five-artifact Saved Work, handoff inclusion/editing/replacement, oversize handling, receiving workflow, storage failures, multi-tab deletion, privacy capture, axe, narrow widths and long Unicode output. All accepted suites remain.

Tests and visual inspection do not constitute actual NVDA/VoiceOver/TalkBack certification or physical-phone keyboard testing. Executed results and outstanding gates belong in PHASE-6-ACCEPTANCE.md.
