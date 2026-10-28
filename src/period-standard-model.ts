import {
  contentVersion,
  periodValues,
  periodExercise,
  periodBook,
  type PeriodValueId,
} from './period-content.ts';
export type PeriodDraft = {
  valueId: PeriodValueId | '';
  standard: string;
  nextApplication: string;
  returnPlan: string;
  contentVersion: string;
};
export type PeriodSession = { draft: PeriodDraft; view: 'edit' | 'card'; notice: string };
export const newPeriodSession = (): PeriodSession => ({
  draft: { valueId: '', standard: '', nextApplication: '', returnPlan: '', contentVersion },
  view: 'edit',
  notice: '',
});
export const characterCount = (text: string) => Array.from(text).length;
export const hasPeriodDraft = (d: PeriodDraft) =>
  !!(d.valueId || d.standard || d.nextApplication || d.returnPlan);
export const periodFields = ['standard', 'nextApplication', 'returnPlan'] as const;
export type PeriodField = (typeof periodFields)[number];
export const periodLimits = { standard: 500, nextApplication: 300, returnPlan: 300 } as const;
export const periodLabels = {
  standard: 'My standard',
  nextApplication: 'Next situation and action',
  returnPlan: 'Support or correction',
};
export function periodErrors(d: PeriodDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!periodValues.some((v) => v.id === d.valueId)) errors.valueId = 'Choose a value to focus on.';
  for (const f of periodFields) {
    if (characterCount(d[f]) > periodLimits[f])
      errors[f] = `Use ${periodLimits[f]} characters or fewer. Your words have not been shortened.`;
    else if (f !== 'returnPlan' && !d[f].trim())
      errors[f] =
        f === 'standard'
          ? 'Write one behavior or boundary you can own.'
          : 'Name a situation and the action you will take there.';
  }
  return errors;
}
export function enterPeriodExercise(session: PeriodSession, valueId: PeriodValueId): PeriodSession {
  return hasPeriodDraft(session.draft)
    ? { ...session, notice: 'You already have a standard in progress.' }
    : { ...session, draft: { ...session.draft, valueId }, notice: '' };
}
export function periodCardText(d: PeriodDraft): string {
  return [
    'Your standard card',
    'Status: Chosen, not yet demonstrated',
    '',
    'Value',
    periodValues.find((v) => v.id === d.valueId)?.name || '',
    '',
    ...periodFields
      .filter((f) => f !== 'returnPlan' || d[f].trim())
      .flatMap((f) => [periodLabels[f], d[f], '']),
    periodExercise.footnote,
    '',
    periodExercise.source,
    periodBook.url,
  ].join('\n');
}
