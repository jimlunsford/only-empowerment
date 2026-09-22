# Tool responsibilities

All six tools are planned. Phase 1 implements outlines, not these workflows.

| Tool | Job | Basis | Output | Intended handoff |
| --- | --- | --- | --- | --- |
| Decision Room | Deliberate among options through values and practical consequences; user chooses | PERIOD Code | Decision Record | Next Move, after a decision |
| Next Move | Convert a direction or stuck point into one meaningful executable action | Pure Execution Mode | Execution Card | Optional Do It Now when ready, or simply leave and act |
| Reset | Identify the miss, affected standard, failed structure, correction, and immediate proof | Rebuild Yourself + Discipline Loop | Reset Plan | Build a Standard if a recurring miss exposes an unclear line |
| Build a Standard | Define a specific standard, reason, supporting and violating behaviors, protection, correction, and non-negotiables | PERIOD Code + standards sections of Rebuild Yourself | Personal Standard | Do It Now for the first act that demonstrates it |
| Rebuild Map | Connect old/new standard, structure, repeated action, evidence, self-trust, identity, negotiation, and ownership | Rebuild Yourself | Rebuild Map | Next Move to select one executable step |
| Do It Now | Begin something already understood; optionally time it; record the actual result | Pure Execution Mode | Action Record | No default onward loop |

## Boundaries and required output fields

Decision Room does not rank people or choose the winning option. Record decision context, options, value conflicts, controllable part, consequences, uncertainty, reversibility, chosen option and reason, next action, and optional review condition.

Next Move does not solve the entire situation. Record desired movement, controllable action, obstacle or unnecessary negotiation, start condition, completion evidence, and first step. A real information gap can produce an action to obtain information.

Reset does not excuse the miss or attach a failure identity. Record facts, affected standard, structural gap, corrective action, protection against recurrence, and evidence to create now.

Build a Standard does not impose the author's standard. Record the user's line, purpose, observable behaviors, violation examples, protective structure, correction response, and what remains non-negotiable. Adapting structure is not automatically abandoning the standard.

Rebuild Map is a map, not a promise of transformation. Record the chain linking changed standard to repeated behavior and expected evidence. Separate hoped-for identity changes from observable actions.

Do It Now is short. Record the known task, smallest real action, begin state, and user-reported completion/partial result/blocker. Timer expiry never marks completion. A timer is optional and not a Phase 1 deliverable.

## Phase 2 implementation status

Next Move is now the sole reference implementation on the feature candidate. Its output remains Planned. See PHASE-2-ACCEPTANCE.md for review status. Decision Room, Reset, Build a Standard, Rebuild Map and Do It Now are outlines, not available workflows.


## Phase 3 Decision Room candidate

Next Move is accepted reference functionality. Decision Room is implemented on the Phase 3 candidate, producing Decision Records and optionally handing reviewed in-memory fields into Next Move. The remaining four tools are not implemented.

## Current Phase 4 candidate

Decision Room and Next Move are accepted. Build a Standard is the third candidate, producing Personal Standards with Status: Set. It supports deliberate adaptation and correction, with no Reset analysis or Do It Now handoff. Its standalone artifact is the outcome. Reset, Rebuild Map and Do It Now remain outlines. Earlier phase sections above are historical.
