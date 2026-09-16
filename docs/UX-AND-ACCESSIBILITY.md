# UX and accessibility

Baseline: [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/). This is a target and release gate, not a claim of certification. Automated checks cover only part of accessibility.

## Interaction

Teach before asking when context improves the answer. Keep the lesson close to its question. Ask one meaningful decision at a time in real workflows. Optional reflection must be clearly optional. Avoid forced positivity, shame, identity labels, or interpreting non-completion as failure. Users can revise, defer, or leave. Progress describes steps, never personal quality.

Challenge a behavior or assumption with a useful question. Do not challenge a person's worth. A real constraint is not automatically an excuse. Ownership is not control over other people. Support can be a deliberate action, not a failure of agency.

## Accessible foundations

- Native links, buttons, inputs, labels, headings, lists, and landmarks.
- Skip link; visible keyboard focus; deliberate route-heading focus; no keyboard traps.
- Label every field, associate instructions and errors, focus the invalid field, and announce errors and copy status.
- Progress expressed in text with `aria-current="step"`; no color-only state.
- Body text contrast at least 4.5:1, large text at least 3:1; visible control boundaries and focus.
- Touch controls generally at least 44 CSS px tall; WCAG minimum target exceptions must be considered for inline text links.
- Support 320 CSS px viewport, 200% text enlargement, 400% browser zoom/reflow, portrait/landscape, reduced motion, and forced colors.
- No time limit; no automatic advancement. Any later timer must be optional, pausable, and unrelated to scoring or auto-completion.
- Output text selectable and readable with a screen reader; print in monochrome with predictable headings.

## Mobile

A single-column question with lesson and action controls nearby. No hover dependency, wide comparison table, persistent large sidebar, or tiny navigation. Stack option comparisons into cards. Keep the output useful on a phone and printed page. Use readable 16px-plus input text to avoid mobile auto-zoom. Long unbroken answers wrap.

## Initial visual direction

Typographic wordmark, warm off-white canvas, dark evergreen text/actions, muted green surfaces, restrained borders, generous spacing, and clear hierarchy. System fonts avoid third-party requests and font licensing/deployment complexity. Native form controls are polished without replacing their semantics. No motivational imagery or complex logo system.

The homepage exposes situations before tool names, with honest “In development” status and useful outlines. A staging banner makes the unfinished state visible. Secondary framework and source attribution remains readable without taking over the task.

## Validation

Run axe against all shell routes and both preview states, desktop/mobile layouts, keyboard skip/nav/form/copy flow, associated errors, back/forward, no horizontal overflow, reduced motion, and long-answer print checks. Manual screen-reader testing with at least VoiceOver/Safari or NVDA/Firefox is required before a finished tool's production release. Browser automation alone is not that test.
