export const standardLabels = {
  area: 'Area / situation',
  standard: 'My standard',
  reason: 'Why it matters',
  keeping: 'What keeping it looks like',
  violations: 'What violates it',
  structure: 'Structure that protects it',
  adaptation: 'When I would deliberately adapt it',
  nonNegotiation: 'What I will not negotiate in the moment',
  correction: 'Correction after a miss',
} as const;
export type StandardField = keyof typeof standardLabels;
export type StandardList = 'keeping' | 'violations';
export type StandardTextField = Exclude<StandardField, StandardList>;
export type Standard = Record<StandardTextField, string> & Record<StandardList, string[]>;
export const standardFields = Object.keys(standardLabels) as StandardField[];
export const STANDARD_TEXT_LIMIT = 2000;
export const STANDARD_ITEM_LIMIT = 1000;
export const STANDARD_LIST_MAX = 5;
export const standardSteps = [
  'context',
  'line',
  'reason',
  'behavior',
  'structure',
  'pressure',
  'correction',
] as const;
export type StandardStep = (typeof standardSteps)[number] | 'review' | 'record';
export const standardStepFields: Record<(typeof standardSteps)[number], StandardField[]> = {
  context: ['area'],
  line: ['standard'],
  reason: ['reason'],
  behavior: ['keeping', 'violations'],
  structure: ['structure'],
  pressure: ['adaptation', 'nonNegotiation'],
  correction: ['correction'],
};
export const emptyStandard = (): Standard => ({
  area: '',
  standard: '',
  reason: '',
  keeping: [''],
  violations: [''],
  structure: '',
  adaptation: '',
  nonNegotiation: '',
  correction: '',
});
export type StandardSession = {
  standard: Standard;
  step: StandardStep;
  savedKey: string | null;
  savedRaw: string | null;
};
export const newStandardSession = (): StandardSession => ({
  standard: emptyStandard(),
  step: 'context',
  savedKey: null,
  savedRaw: null,
});
export function standardTextError(value: unknown, limit: number): string {
  if (typeof value !== 'string' || !value.trim()) return 'Add your own words before continuing.';
  return value.length > limit
    ? `Keep this response within ${limit.toLocaleString('en-US')} characters. Your text has not been shortened.`
    : '';
}
export function standardErrors(
  s: Standard,
  fields: StandardField[] = standardFields,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f === 'keeping' || f === 'violations') {
      if (s[f].length < 1 || s[f].length > STANDARD_LIST_MAX)
        errors[f] = 'Use one to five behaviors.';
      s[f].forEach((v, i) => {
        const e = standardTextError(v, STANDARD_ITEM_LIMIT);
        if (e) errors[`${f}-${i}`] = e;
      });
    } else {
      const e = standardTextError(s[f], STANDARD_TEXT_LIMIT);
      if (e) errors[f] = e;
    }
  }
  return errors;
}
export function validStandard(value: unknown): value is Standard {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const s = value as Standard;
  if (Object.keys(s).length !== standardFields.length) return false;
  return standardFields.every((f) =>
    f === 'keeping' || f === 'violations'
      ? Array.isArray(s[f]) &&
        s[f].length >= 1 &&
        s[f].length <= STANDARD_LIST_MAX &&
        s[f].every((v) => !standardTextError(v, STANDARD_ITEM_LIMIT))
      : !standardTextError(s[f], STANDARD_TEXT_LIMIT),
  );
}
export function hasStandardWork(s: Standard): boolean {
  return standardFields.some((f) =>
    Array.isArray(s[f]) ? (s[f] as string[]).some(Boolean) : !!s[f],
  );
}
export function standardText(s: Standard): string {
  return [
    'ONLY EMPOWERMENT',
    'Personal Standard',
    '',
    ...standardFields.flatMap((f) => [
      standardLabels[f],
      Array.isArray(s[f]) ? (s[f] as string[]).map((v) => `- ${v}`).join('\n') : (s[f] as string),
      '',
    ]),
    'Status',
    'Set',
  ].join('\n');
}
