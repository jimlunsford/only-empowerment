export const lenses = [
  'ownership',
  'purpose',
  'resilience',
  'integrity',
  'discipline',
  'empowerment',
] as const;
export type Lens = (typeof lenses)[number];
export const decisionFields = [
  'decision',
  'matters',
  ...lenses,
  'uncertainty',
  'rationale',
  'firstMove',
] as const;
export type DecisionField = (typeof decisionFields)[number];
export const decisionLabels: Record<DecisionField, string> = {
  decision: 'Decision',
  matters: 'What matters',
  ownership: 'Ownership',
  purpose: 'Purpose',
  resilience: 'Resilience',
  integrity: 'Integrity',
  discipline: 'Discipline',
  empowerment: 'Empowerment',
  uncertainty: 'Uncertainty',
  rationale: 'Why I chose it',
  firstMove: 'First move',
};
export const decisionLimits: Record<DecisionField, number> = {
  decision: 2000,
  matters: 2000,
  ownership: 2000,
  purpose: 2000,
  resilience: 2000,
  integrity: 2000,
  discipline: 2000,
  empowerment: 2000,
  uncertainty: 2000,
  rationale: 2000,
  firstMove: 1000,
};
export const reversibilities = [
  'Easy to reverse',
  'Costly to reverse',
  'Effectively irreversible',
  'Not yet known',
] as const;
export type Option = { id: string; label: string; tradeoff: string; reversibility: string };
export type Decision = Record<DecisionField, string> & { options: Option[]; chosenId: string };
export const newOption = (): Option => ({
  id: crypto.randomUUID(),
  label: '',
  tradeoff: '',
  reversibility: '',
});
export const emptyDecision = (): Decision => ({
  ...(Object.fromEntries(decisionFields.map((f) => [f, ''])) as Record<DecisionField, string>),
  options: [newOption(), newOption()],
  chosenId: '',
});
export type DecisionStep =
  | 'define'
  | 'options'
  | 'matters'
  | Lens
  | 'practical'
  | 'uncertainty'
  | 'readiness'
  | 'choice'
  | 'reason'
  | 'review'
  | 'record'
  | 'pause'
  | 'handoff';
export const decisionSteps: DecisionStep[] = [
  'define',
  'options',
  'matters',
  ...lenses,
  'practical',
  'uncertainty',
  'readiness',
  'choice',
  'reason',
];
export type DecisionSession = {
  decision: Decision;
  step: DecisionStep;
  readiness: string;
  savedKey: string | null;
  savedRaw: string | null;
};
export const newDecisionSession = (): DecisionSession => ({
  decision: emptyDecision(),
  step: 'define',
  readiness: '',
  savedKey: null,
  savedRaw: null,
});
export const decisionReadiness = [
  ['ready', 'I am ready to choose.'],
  ['information', 'I need more information.'],
  ['support', 'I need professional or personal guidance.'],
  ['prerequisite', 'A prerequisite is unresolved.'],
  ['safety', 'Safety needs consideration.'],
  ['options', 'The options are not clear enough.'],
  ['changed', 'Circumstances changed.'],
  ['uncertain', 'I am not ready to choose.'],
] as const;
export function textError(value: string, limit: number, label: string): string {
  if (!value.trim())
    return `Add ${label.toLowerCase()} in your own words. “I don’t know” is a valid reflection.`;
  return value.length > limit
    ? `Use ${limit} characters or fewer. Your text has not been shortened.`
    : '';
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function validDecision(value: unknown): value is Decision {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const d = value as Decision;
  if (
    Object.keys(d).length !== decisionFields.length + 2 ||
    !decisionFields.every(
      (f) => typeof d[f] === 'string' && !textError(d[f], decisionLimits[f], decisionLabels[f]),
    )
  )
    return false;
  if (!Array.isArray(d.options) || d.options.length < 2 || d.options.length > 4) return false;
  if (
    !d.options.every(
      (o) =>
        o &&
        typeof o === 'object' &&
        Object.keys(o).length === 4 &&
        typeof o.id === 'string' &&
        uuid.test(o.id) &&
        typeof o.label === 'string' &&
        !textError(o.label, 300, 'option') &&
        typeof o.tradeoff === 'string' &&
        !textError(o.tradeoff, 2000, 'tradeoffs') &&
        reversibilities.includes(o.reversibility as (typeof reversibilities)[number]),
    )
  )
    return false;
  return (
    new Set(d.options.map((o) => o.id)).size === d.options.length &&
    d.options.some((o) => o.id === d.chosenId)
  );
}
export function decisionText(d: Decision): string {
  return [
    'ONLY EMPOWERMENT',
    'Decision Record',
    '',
    'Decision',
    d.decision,
    '',
    'Options considered',
    ...d.options.map((o, i) => `${i + 1}. ${o.label}`),
    '',
    ...(['matters', ...lenses] as DecisionField[]).flatMap((f) => [decisionLabels[f], d[f], '']),
    'Practical tradeoffs',
    ...d.options.flatMap((o) => [o.label, o.tradeoff, `Reversibility: ${o.reversibility}`, '']),
    'Uncertainty',
    d.uncertainty,
    '',
    'Chosen option',
    d.options.find((o) => o.id === d.chosenId)?.label || '',
    '',
    'Why I chose it',
    d.rationale,
    '',
    'First move',
    d.firstMove,
    '',
    'Status',
    'Decided',
  ].join('\n');
}
export type DecisionHandoff = {
  situation: string;
  action: string;
  includeSituation: boolean;
  includeAction: boolean;
};
export function prepareHandoff(d: Decision): DecisionHandoff {
  return {
    situation: d.decision,
    action: d.firstMove,
    includeSituation: true,
    includeAction: true,
  };
}
