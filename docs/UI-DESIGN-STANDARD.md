# UI Design Standard

## Purpose

Only Empowerment favors clear hierarchy and useful information over decorative interface furniture. This is the governing visual-language standard for current and future user-facing work.

## Core rule

Every visible element must communicate information, enable an action, or establish necessary hierarchy.

If removing it does not make the interface harder to understand or use, remove it.

## Prohibited default patterns

Do not introduce eyebrow, kicker, or overline labels; decorative all-caps category labels; decorative card numbering or arbitrary numeric indices; redundant CTA pills inside already-clickable cards; badges that merely repeat a heading, card title, or link action; or ornamental metadata without user value. Renaming an obsolete class does not make the pattern acceptable.

## Allowed when meaningful

Keep workflow progress, actual ordered steps, form labels and instructions, validation, environment status, privacy/security warnings, artifact statuses, metadata users need, and accessibility-only semantics. Small text and numbers are not inherently decoration. Saved Work needs artifact type and status; a multi-step workflow needs its real progress. The staging banner communicates deployment state.

## Hierarchy rule

Prefer page titles, section headings, body copy, spacing, grouping, and restrained borders before adding another label layer. After removing decoration, rebalance spacing, padding, alignment, and mobile wrapping. Remove dead wrappers, props, and CSS rather than leaving empty slots.

Preserve the warm off-white canvas, dark evergreen typography/actions, muted green surfaces, system typography, responsive layout, and print behavior. This rule does not authorize a new color system, component library, ornamental badges, illustrations, or decorative shadows.

## Card rule

Peer cards should not be numbered merely to decorate them. The six tools are peers, not a prescribed sequence.

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
