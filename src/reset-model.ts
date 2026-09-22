import type { Standard } from './standard-model.ts';
export const resetLabels = {
  slip: 'What slipped',
  standard: 'Standard I am returning to',
  ownership: 'What I own now',
  weakPoint: 'Weak point to repair',
  correction: 'Immediate correction',
  structure: 'Structure I will restore or change',
  proof: 'Proof I will create next',
} as const;
export type ResetField = keyof typeof resetLabels;
export type ResetPlan = Record<ResetField, string>;
export const resetFields = Object.keys(resetLabels) as ResetField[];
export const RESET_LIMIT = 2000;
export const resetSteps = [
  'slip',
  'standard',
  'ownership',
  'weakPoint',
  'correction',
  'structure',
  'proof',
] as const;
export type ResetStep = ResetField | 'pause' | 'review' | 'record';
export type StandardSource = '' | 'manual' | 'saved' | 'unclear';
export type StandardStanding = '' | 'stands' | 'review' | 'unsure';
export type ResetSession = {
  plan: ResetPlan;
  step: ResetStep;
  source: StandardSource;
  standing: StandardStanding;
  checkedStandard: string | null;
  reference: Standard | null;
  selectedKey: string | null;
  returnToReview: boolean;
  savedKey: string | null;
  savedRaw: string | null;
};
export const emptyReset = (): ResetPlan => ({
  slip: '',
  standard: '',
  ownership: '',
  weakPoint: '',
  correction: '',
  structure: '',
  proof: '',
});
export const newResetSession = (): ResetSession => ({
  plan: emptyReset(),
  step: 'slip',
  source: '',
  standing: '',
  checkedStandard: null,
  reference: null,
  selectedKey: null,
  returnToReview: false,
  savedKey: null,
  savedRaw: null,
});
export function resetTextError(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return 'Add your own words before continuing.';
  return value.length > RESET_LIMIT
    ? 'Keep this response within 2,000 characters. Your text has not been shortened.'
    : '';
}
export function resetErrors(
  plan: ResetPlan,
  fields: ResetField[] = resetFields,
): Record<string, string> {
  return Object.fromEntries(
    fields.map((f) => [f, resetTextError(plan[f])]).filter(([, error]) => error),
  );
}
export function validReset(value: unknown): value is ResetPlan {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === resetFields.length &&
    resetFields.every((f) => !resetTextError((value as ResetPlan)[f]))
  );
}
export function standardConfirmed(s: ResetSession): boolean {
  return (
    (s.source === 'manual' || s.source === 'saved') &&
    s.standing === 'stands' &&
    s.checkedStandard === s.plan.standard &&
    !resetTextError(s.plan.standard)
  );
}
export function resetText(plan: ResetPlan): string {
  return [
    'ONLY EMPOWERMENT',
    'Reset Plan',
    '',
    ...resetFields.flatMap((f) => [resetLabels[f], plan[f], '']),
    'Status',
    'Planned',
  ].join('\n');
}
