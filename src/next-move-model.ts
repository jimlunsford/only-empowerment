export const fields = ['situation', 'action', 'start', 'obstacle', 'completion'] as const;
export type Field = (typeof fields)[number];
export type Card = Record<Field, string>;
export const labels: Record<Field, string> = {
  situation: 'Situation',
  action: 'My next move',
  start: 'Start condition',
  obstacle: 'Likely obstacle or negotiation',
  completion: 'Completion boundary',
};
export const limits: Record<Field, number> = {
  situation: 2000,
  action: 2000,
  start: 1000,
  obstacle: 2000,
  completion: 2000,
};
export const emptyCard = (): Card => ({
  situation: '',
  action: '',
  start: '',
  obstacle: '',
  completion: '',
});
export function validateField(field: Field, value: string): string {
  if (!value.trim()) return `Add ${labels[field].toLowerCase()} in your own words.`;
  if (value.length > limits[field])
    return `Use ${limits[field]} characters or fewer. Your text has not been shortened.`;
  return '';
}
export function validCard(value: unknown): value is Card {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    Object.keys(candidate).length === fields.length &&
    fields.every((f) => typeof candidate[f] === 'string' && !validateField(f, candidate[f]))
  );
}
export function cardText(card: Card): string {
  return [
    'ONLY EMPOWERMENT',
    'Execution Card',
    '',
    ...fields.flatMap((f) => [labels[f], card[f], '']),
    'Status',
    'Planned',
  ].join('\n');
}
export type Step = 0 | 1 | 2 | 3 | 4 | 5 | 'review' | 'card' | 'pause';
export type Session = {
  fromDecision?: boolean;
  fromRebuild?: boolean;
  card: Card;
  step: Step;
  readiness: string;
  obstacleKind: string;
  savedKey: string | null;
  savedRaw: string | null;
};
export const newSession = (): Session => ({
  card: emptyCard(),
  step: 0,
  readiness: '',
  obstacleKind: '',
  savedKey: null,
  savedRaw: null,
});
export const readinessChoices = [
  ['ready', 'The direction is decided; I can define the next action.'],
  ['decision', 'I have not made the decision.'],
  ['information', 'I need more information.'],
  ['prerequisite', 'A resource, permission, or other prerequisite is missing.'],
  ['safety', 'Safety needs consideration.'],
  ['support', 'I need professional or personal support.'],
  ['changed', 'Circumstances changed.'],
  ['uncertain', 'I am not ready to define this yet.'],
] as const;
export type FutureHandoff = {
  source: 'next-move';
  target: 'do-it-now';
  status: 'Planned';
  fields: Partial<Pick<Card, 'action' | 'start' | 'completion'>>;
};
// Pure, in-memory contract only. No target route is launched or private text put in a URL.
export function handoffPreview(
  card: Card,
  selected: ('action' | 'start' | 'completion')[],
): FutureHandoff {
  return {
    source: 'next-move',
    target: 'do-it-now',
    status: 'Planned',
    fields: Object.fromEntries(selected.map((f) => [f, card[f]])),
  };
}
