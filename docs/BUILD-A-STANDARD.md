# Build a Standard

Phase 4 candidate. The user defines the standard; the software cannot recommend, certify, rank, diagnose, or rewrite it. The Personal Standard is the successful standalone outcome. No Reset or Do It Now workflow or automatic cross-tool transfer is implemented.

## Source review, 2026-09-22

Live canonical pages were inspected before lesson drafting. Standards article URLs were located from the site's live WordPress index, not guessed. These sources are authoritative alongside PRODUCT-DOCTRINE.md and the owner's Phase 4 instruction:

- [The PERIOD Code](https://jimlunsford.com/period-code/): ownership, values expressed through behavior, integrity without perfection, discipline as repeated action, support without surrendering responsibility.
- [Core Frameworks](https://jimlunsford.com/core-frameworks/): preserves values, process, reinforcement, and execution as distinct roles.
- [How to Rebuild Yourself](https://jimlunsford.com/how-to-rebuild-yourself/): raise the line, support it with structure, repeat action, create proof. Setting a standard creates no behavioral proof.
- [Standards Must Adapt](https://jimlunsford.com/recovery-standard-standards-must-adapt/): distinguish a principle from its current method; honestly review changed circumstances rather than quietly eroding the line.
- [Stop Negotiating](https://jimlunsford.com/discipline-dispatch-stop-negotiating/): unnecessary bargaining is distinct from legitimate rest, information, or a responsible adjustment.
- [Systems Hold](https://jimlunsford.com/recovery-standard-systems-hold/): preparation and repeatable structure reduce dependence on the mood of the moment.
- [Repair Over Perfection](https://jimlunsford.com/recovery-standard-repair-over-perfection/): correction without minimizing the miss or turning it into identity collapse.
- [Return Faster](https://jimlunsford.com/discipline-dispatch-return-faster/): a concrete return prevents a miss from becoming the next pattern; punishment is not repair.

`src/standard-lessons.ts` contains concise original adaptations with lesson key, source URLs, canonical/context source, reviewed date, tool, next question, framework, and reviewer. Implementation review is by Codex; Jim's product approval remains pending. Full articles are not bundled.

PERIOD informs the work itself: Ownership in a line the user controls, Purpose in its reason, Integrity in observable keeping/violating behavior, Resilience in structure and deliberate adaptation, Discipline in repeatable behavior and correction, Empowerment in capability with appropriate support. There are no six-lens reflection fields.

## Workflow

| Stage | Purpose | User-authored content |
| --- | --- | --- |
| Context | Enough context to understand the record later, without mandatory categories or intake | Area / situation |
| Line | Distinguish a goal's desired outcome from behavior or a boundary the person owns | My standard |
| Reason | Preserve the ordinary reason that makes the line worth carrying | Why it matters |
| Behavior | Make both sides of the line recognizable without mathematical perfection | One to five keeping behaviors and one to five violating behaviors |
| Structure | Reduce repeated negotiation through preparation, routines, environment, support or boundaries the user chooses | Structure that protects it |
| Pressure | Put deliberate change beside the part discomfort alone will not rewrite | Adaptation rule, including how to decide; non-negotiation line |
| Correction | Define a concrete response to a future miss without analyzing an actual incident | Correction after a miss |
| Review | Read the actual artifact and edit any section before choosing it | All nine sections, in final order |

The review begins as a readable artifact with section-level edit controls. It does not present another wall of textareas. Add/remove list controls have labels, bounds, confirmation, focus restoration and announcements. At least one item remains in each list. Removing an item never rewrites surviving items.

Vague language is taught against with examples; non-empty vague wording is accepted. All standard forms remain available: minima, boundaries, cadence, responsibilities, positive or negative behavior. No grammatical template is forced. There is no semantic analysis or standard recommendation.

Deliberate adaptation can change the standard itself where circumstances, information, responsibilities, health/safety, or design warrant it. The user defines both the circumstances and review process. Urgent health or safety needs do not wait for a schedule. The application never decides whether a change is legitimate.

## Artifact and status

Exact fields in order: Area / situation; My standard; Why it matters; What keeping it looks like; What violates it; Structure that protects it; When I would deliberately adapt it; What I will not negotiate in the moment; Correction after a miss. Status: **Set**.

Set means the user deliberately chose the standard. It does not mean kept, proven, maintained, mastered, or completed. The user can return to review after setting, edit all sections, and set again. Editing saved work does not change its persisted bytes until explicit Save changes.

Plain text starts with `ONLY EMPOWERMENT` and `Personal Standard`, uses the exact section labels and hyphen list items, and ends with `Status` / `Set`. No lessons, controls, metadata, or navigation. Clipboard failure exposes selected read-only text with a Select all text action. Print reuses accepted artifact CSS, flowing sections and long text, small builder/secondary framework attribution, and no navigation/banner/controls. Browser PDF output is not claimed to be tagged accessible PDF.

## Bounds and preservation

Seven text fields: 2,000 UTF-16 code units each. Each behavior list: one to five items, 1,000 code units per item. These follow existing 2,000-character artifact paragraphs while keeping behavior items concise. All limits are shown before validation. Oversized input remains editable and is never silently truncated. Long unbroken runs receive discretionary HTML break opportunities between groups of four Unicode grapheme clusters; no text character is inserted, removed or rewritten. Ordinary prose is unchanged. Original whitespace, Unicode, punctuation and multiline content are retained subject to native textarea newline normalization. Maximum serialized JSON ceiling: 160,000 code units, enough for worst-case six-character JSON escaping of all bounded text.

## Local records

Namespace: `oe:personal-standard:v1:<UUID-v4>`.

Shape: `{schemaVersion:1,id,tool:"build-a-standard",status:"Set",standard:{area,standard,reason,keeping:string[],violations:string[],structure,adaptation,nonNegotiation,correction}}`.

Only a confirmed artifact can be explicitly saved. No timestamps, scores, draft history, framework metadata, analytics or account identifiers. Validation checks exact shape, bounds, required content, ID/key agreement, schema, tool and status. Unknown/corrupt records stay untouched and are reported by Saved Work. No existing record migration.

All three artifact types share 50 oe:-owned keys total, including unsupported records. Existing saves can update at capacity. Save reads back exact bytes before reporting success. Stale serialized bytes refuse overwrite/recreation. Quota, denial, and readback failures preserve current memory and report uncertainty honestly. The accepted localStorage concurrency limitation remains: simultaneous explicit writes are not a transactional multi-user store.

Per-record deletion, all-namespace deletion, BroadcastChannel, storage events, visibility checks and saved-list refresh extend to standards. A delete-all broadcast clears memory-only sessions where supported. Storage-event fallback can clear persisted records, but cannot announce a memory-only deletion with no key change. Delete never calls localStorage.clear() and preserves unrelated keys. Clipboard/PDF/print/screenshot/backups/extensions remain outside its scope.

## Implementation limits

No added dependency. Preact text rendering only, no generated user links or HTML injection. No network application service, account, analytics, AI, submission, remote runtime asset, cloud save, or synchronization. CSP retains connect-src 'none' and form-action 'none'.

Automation and semantic snapshots are not actual NVDA, VoiceOver, TalkBack or JAWS testing. Real assistive-technology and physical-phone testing must be identified separately, never inferred from axe or screenshots. Executed results and remaining gates belong in PHASE-4-ACCEPTANCE.md.
