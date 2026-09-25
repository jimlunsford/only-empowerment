# Output artifact standard

An output is usable outside the app. It preserves user authorship and enough context to understand the choice or action later.

Every artifact needs a clear type, tool name, user-defined situation, labeled sections, a concrete next action or result, and an explicit status. Dates are optional and meaningful, not tracking identifiers. Distinguish planned, attempted, and completed. Never mark action complete because a form was submitted or a timer expired.

| Artifact | Distinctive content |
| --- | --- |
| Decision Record | Options, relevant values, tradeoffs, chosen option, rationale, uncertainty, first action |
| Execution Card | One action, start condition, obstacle, completion boundary |
| Reset Plan | Miss, affected standard, structural repair, immediate corrective action |
| Personal Standard | Line, reason, supporting/violating behavior, protection, correction |
| Rebuild Map | Standard-to-structure-to-action relationships; proof and next move |
| Action Record | What began, what happened, completion/partial/blocker evidence |

## Rendering rules

Use semantic headings and sections. Render all user content as text, preserving line breaks. No raw HTML or user-supplied link rendering. Wrap long words and support long responses over multiple print pages. Do not shrink type until it becomes unreadable. Avoid branding that consumes the useful page.

Provide editable review before finalizing. Copy must produce understandable plain text, not interface labels or navigation. Announce clipboard success and failure. Provide manual selection when clipboard permissions fail. Clipboard sync is outside app control.

Print only the artifact, with readable monochrome text, sensible margins, no controls/navigation, and no color-only meaning. Browser Save as PDF is enough for v1. Do not add a server PDF service. Browser print headers may add URL/date; users control them in the print dialog. PDFs, printers, screenshots, downloads, and copied text are outside local deletion.

Keep framework attribution secondary and builder attribution small. Include source/version when needed to explain output format, without adding user identifiers. Structured import/export is deferred; any future file format must be versioned, bounded, validated, and parsed as data.

## Phase 1

The sample card is a design artifact only. It records one sample action and labels it planned. It is not an Execution Card reference implementation or a completed Action Record. Copy and print establish the basic rendering boundary; full six-tool outputs remain unbuilt.

## Implemented Next Move candidate

Execution Card order: Situation, My next move, Start condition, Likely obstacle or negotiation, Completion boundary. Status is always **Planned**. The artifact retains exact strings, including leading/trailing whitespace and line breaks, subject to native textarea newline normalization. No semantic transformation, automatic links, inference, or HTML rendering occurs.

All five fields are editable before confirmation and after confirmation in the same session. Saved-card edits require another explicit save. Copy uses these labels and plain text headed `ONLY EMPOWERMENT` and `Execution Card`, ending `Status` / `Planned`. Failed clipboard access exposes a labeled, selected, read-only text area. Print uses only the card, small attribution, monochrome text, 18mm margins, and flowing multi-page paragraphs. Browser PDF tagging is not claimed.

Bounds are 2,000 UTF-16 code units per situation/action/obstacle/completion field and 1,000 for start condition. The UI calls these characters using the browser's string-length convention. Text exceeding a limit remains visible and editable; validation never truncates it. These bounds allow meaningful paragraphs, 600+ character unbroken strings, and several printed pages while limiting record size. The final card excludes readiness choices and other intermediate reflection state.


## Phase 3 Decision Room candidate

Decision Records are implemented with explicit Decided status, all six distinct reflections, per-option tradeoffs/reversibility, uncertainty, user-selected option, rationale and first move. Confirmation remains editable. Field bounds, exact copy order and print behavior are in DECISION-ROOM.md.

## Phase 4 Personal Standard

Personal Standard uses nine authored sections and **Set** status, distinct from Decided and Planned. Exact field order, copy format, bounds, review editing and print behavior are in BUILD-A-STANDARD.md. Set records deliberate choice only. The artifact excludes lessons, form instructions, navigation and internal source-governance metadata. Keeping and violating behaviors are semantic lists, one to five items each.


## Phase 5 Reset Plan

Exact authored order: What slipped; Standard I am returning to; What I own now; Weak point to repair; Immediate correction; Structure I will restore or change; Proof I will create next. Status: **Planned**. This means a correction and return plan exists, not that correction or proof happened. All seven paragraphs allow 2,000 UTF-16 code units. Exact copy, review, snapshot and print behavior are specified in RESET.md. Decision Record remains Decided, Execution Card remains Planned, Personal Standard remains Set. No existing schema changes.

## Phase 6 Rebuild Map

Rebuild Map uses nine authored sections and **Mapped** status: a system has been mapped, not performed or proven. This is consistent with Decided, Planned and Set describing artifact state. No old schema or status changes. See REBUILD-MAP.md for exact section order, one-to-five repeated actions, bounds, copy, print and editable review. Identity is an effect of future behavioral evidence, not an authored identity claim or certification.
