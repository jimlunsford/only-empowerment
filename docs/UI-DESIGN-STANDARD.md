# UI Design Standard

## Purpose

Only Empowerment favors clear hierarchy and useful information over decorative interface furniture. This is the governing visual-language standard for current and future user-facing work.

## Core rule

Every visible element must communicate information, enable an action, or establish necessary hierarchy.

If removing it does not make the interface harder to understand or use, remove it.

## Prohibited default patterns

Do not introduce eyebrow, kicker, or overline labels; decorative all-caps category labels; decorative card numbering or arbitrary numeric indices; redundant CTA pills inside already-clickable cards; badges that merely repeat a heading, card title, or link action; or ornamental metadata without user value. Renaming an obsolete class does not make the pattern acceptable.

## Allowed when meaningful

Keep workflow progress, actual ordered steps, form labels and instructions, validation, environment status, privacy/security warnings, artifact statuses, metadata users need, and accessibility-only semantics. Small text and numbers are not inherently decoration. Saved Work needs artifact type and status; a multi-step workflow needs its real progress. The staging banner communicates deployment state. On the approved PERIOD internal-review routes, consolidate redundant review notices into one compact, truthful line. Retain necessary environment status and keep source/build details in the footer. Framework title and author attribution identify the source; they are not decorative category labels. These exceptions do not permit ornamental overlines or remove meaningful status from legacy routes.

## Hierarchy rule

Prefer page titles, section headings, body copy, spacing, grouping, and restrained borders before adding another label layer. After removing decoration, rebalance spacing, padding, alignment, and mobile wrapping. Remove dead wrappers, props, and CSS rather than leaving empty slots.

Preserve the warm paper canvas, evergreen actions, readable responsive layouts, and print behavior. Product Vision v0.14 approves the Work 04 Editorial Companion typography and palette for the bounded PERIOD experience: self-hosted Source Serif 4 and Source Sans 3 with their Open Font License notices, system fallbacks, and the documented warm paper (#F7F3EB), evergreen (#173C34), sage (#E5EBE2), clay (#98422E), and supporting accessible tokens. Keep these changes scoped to the approved PERIOD states and necessary shared shell; legacy tools retain their established system typography and presentation. This replaces the system-font-only restriction only within that approved scope.

A separately approved design may use semantic, text-based teaching diagrams and new compositions where they explain a source-grounded relationship. Provide equivalent reading order and a full text explanation at every viewport. Decorative badges, stock imagery, ornamental shadows, and an unrelated component-library replacement remain outside scope. A visual approval is not approval of new public teaching copy.

## Card rule

Peer cards should not be numbered merely to decorate them. The six legacy tools are peers, not a prescribed sequence. The PERIOD values are an intentional teaching sequence. Meaningful 01–06 positions and connecting rules are permitted for that sequence; they must not imply completed learning, mastery, or compulsory progression. Do not apply sequence numbers to unrelated legacy tools.

A fully clickable card should not contain an additional “Try X” control unless it performs a genuinely different action. Situation, tool title, concise description, output name, and the established link/focus affordance are sufficient.

## New-page checklist

Before accepting any new page or section, ask:

1. Does every visible label add information?
2. Does any text merely repeat the heading below it?
3. Are numbers being used because sequence matters?
4. Does a badge enable a distinct action?
5. Could spacing and hierarchy communicate this more cleanly?
6. Would removing the element make the page less understandable?

If the answer to question 6 is no, remove it.

## Accessibility boundary

Visual simplification must never remove meaningful labels, form instructions, status announcements, landmarks, headings, errors, warnings, or other accessibility semantics. Preserve useful accessible names when redundant visible decoration is removed. Do not change product logic, artifact data, privacy, or user-authored output as part of visual cleanup.

## Review requirement

Before creating or materially changing any user-facing page or component, read and comply with this standard. Every new page, component, or substantial UI change must be reviewed against it before acceptance, in the rendered application at desktop and mobile widths and in representative workflow states.

`tests/ui-design-standard.test.mjs` guards known retired implementation patterns. It does not automate subjective design judgment or replace visual and accessibility review.

## Work 05 amendment record

October 29, 2026, feature-branch implementation of Product Vision v0.14 and Work 04 Section 6. Exactly four bounded changes: (1) licensed self-hosted typography and palette, (2) semantic teaching diagrams and compositional flexibility, (3) explicit distinction between ordered PERIOD values and peer legacy tools, and (4) consolidated truthful review status and source identity. Core anti-clutter, privacy, accessibility, and data-integrity requirements remain unchanged. No main-branch or public-release acceptance is implied.

The approved focus refinement uses a separated evergreen outline for keyboard focus and a red input border plus descriptive error text for validation. Both remain visible when an invalid field is focused. Color alone must not communicate either state.
