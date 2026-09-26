# Do It Now

Phase 7 candidate, version 0.1.0-dev.7. Product approval and deployed acceptance are pending.

## Responsibility

Begin an already understood action; optionally time it; record the actual result. Next Move clarifies an action and its completion boundary. Do It Now starts after that decision. It is not a planner, resistance diagnosis, motivational coach, habit tracker, or productivity score.

Four working screens: known task and smallest real action; factual readiness and Begin now; actual result and evidence; editable Action Record review. The confirmed artifact is the exit. No default onward loop.

## Execution semantics

Readiness is an explicit yes/no choice. Missing information, permission, safety, resources, support or preparation permits a clean pause with plain Next Move and Decision Room links. No Started state, timer, artifact or persistence is created by a pause.

Begin now means only that the user reports beginning. It records an in-memory Started state. It neither completes nor saves an artifact. Only after Begin can the user explicitly choose Completed, Partial, or Blocked and supply bounded evidence. Nothing evaluates whether that report is true or whether a blocker is legitimate.

Completed asks what happened that indicates completion. Partial asks what was completed and remains. Blocked asks what prevented continuation after beginning. Review exposes task, first action, factual Started state, explicit result choice and the matching evidence prompt. Changing result clears the previous evidence and requires a fresh report. Started cannot be edited. Confirm Action Record records the user's report; it does not perform an action.

## Optional timer

Off by default. Deliberately select a whole number from 1 to 60 minutes before Begin. The deadline is calculated from an explicit in-memory start time, not counted interval ticks. Visibility and route-return updates use elapsed wall time, so background throttling does not extend the timer. The display is an aid, not precise instrumentation: changes to the device clock can affect it.

A user may report a result before expiry. Expiry announces “Timer ended. What happened?” once through a polite status region. Ticks are not live announcements. Expiry never selects a result. Timer state survives internal navigation in this tab, but reload, clear or replacement discards it. No notifications, permissions, audio, vibration, service worker, request, storage, timer history, timestamps in the artifact or new dependency.

## Action Record

Namespace: `oe:action-record:v1:<UUID-v4>`.

```json
{
  "schemaVersion": 1,
  "id": "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  "tool": "do-it-now",
  "status": "Completed",
  "record": {
    "task": "User-authored known task",
    "firstAction": "User-authored beginning",
    "beginState": "Started",
    "outcome": "User-authored result evidence"
  }
}
```

Allowed status: Completed, Partial, Blocked. Exact outer and inner shapes, UUID-v4/key agreement, tool, schema and Started state are validated. Each authored field requires nonblank text and at most 2,000 UTF-16 code units. Serialized ceiling: 40,000 code units, including worst-case JSON escaping. Text is never silently shortened or rewritten; native textarea newline normalization still applies.

Copy order: Known task, Smallest real action, Begin state, What happened, Status. Plain text is headed ONLY EMPOWERMENT / Action Record and explicitly identifies a user-reported result. It excludes timer, handoff reference, source ID and controls. Rendering escapes text, preserves line breaks, and uses grapheme-safe discretionary wrapping for long tokens. Printing shows only the artifact with small builder and Pure Execution Mode attribution. Browser Save as PDF is sufficient; tagged PDF is not claimed.

## Saving, deletion and synchronization

Memory remains default. Only a confirmed artifact and deliberate Save confirmation writes storage. Begin, expiry, result selection, final confirmation, handoff and navigation never write. No abandoned attempts are stored. Saved edits require another explicit save and exact prior-byte comparison. Readback verifies the write; denial, quota, stale/deleted source and verification failures preserve the in-memory report and show an honest message.

Saved Work supports six artifact types under the same 50-record total, including unsupported oe: keys. Action Record summaries show the task, result evidence and actual status. Earlier valid artifacts retain exact bytes and statuses. No migration occurs. Scoped per-record/all-data deletion, unrelated-key preservation, storage events, BroadcastChannel and visibility rechecks extend existing behavior. The existing simultaneous-tab write and browser-level synchronization limits remain.

## Next Move handoff

The accepted `FutureHandoff` / `handoffPreview` contract remains the transport boundary: next-move to do-it-now, Planned source status, action/start/completion fields. The confirmed Execution Card offers an optional Do it now control. Preview edits the carried strings without changing the card. Action is required; start condition and completion boundary can each be excluded. Cancel transfers nothing.

After explicit transfer, action becomes the known task; the user still names the smallest real action. A carried start condition is displayed and requires “The start condition is met and I can begin now.” A completion boundary is reference only on the result screen, never a status evaluator. The new session is memory-only and unsaved. No private text enters paths, hashes, query strings, titles, external links or requests.

Existing meaningful Do It Now work requires replacement confirmation, with language distinguishing an unstarted session, a started action and an open Action Record. Cancel retains that work. Deliberate replacement clears the previous session and timer but never modifies saved Action Records or Execution Cards. No Build a Standard, Decision Room or Rebuild Map direct transfer is added. Rebuild Map and Decision Room continue through Next Move.

## Source governance

Live canonical sources reviewed 2026-09-25:

- https://jimlunsford.com/pure-execution-mode/
- https://jimlunsford.com/core-frameworks/

The concise original lessons in `src/do-it-now-lessons.ts` carry canonical URL, framework, review date, tool, question and reviewer. Interpretation: a sufficiently understood action can begin without further unnecessary negotiation; missing information, safety, authorization and support still matter. The software records reports, never assigns discipline, identity or proof. Full articles are not copied into runtime. Codex implementation review does not imply owner product approval.
