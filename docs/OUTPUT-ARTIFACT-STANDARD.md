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
