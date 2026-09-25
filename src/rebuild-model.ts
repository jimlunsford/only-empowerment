import type { Standard } from './standard-model.ts';
export const rebuildLabels = {
  area: 'What I am rebuilding',
  reality: 'Current reality',
  standard: 'Standard I am raising to',
  structure: 'Structure I am building',
  actions: 'Actions I will repeat',
  proof: 'Proof that will count',
  trust: 'What I need to trust myself to do',
  negotiation: 'Negotiation I am reducing',
  firstMove: 'First move',
} as const;
export type RebuildField = keyof typeof rebuildLabels;
export type Rebuild = Record<Exclude<RebuildField, 'actions'>, string> & { actions: string[] };
export const rebuildFields = Object.keys(rebuildLabels) as RebuildField[];
export const REBUILD_LIMIT = 2000;
export const ACTION_LIMIT = 1000;
export const ACTION_MAX = 5;
export const rebuildSteps = [
  'context',
  'standard',
  'structure',
  'actions',
  'proof',
  'trust',
  'firstMove',
] as const;
export type RebuildStage = (typeof rebuildSteps)[number];
export type RebuildStep = RebuildStage | 'pause' | 'review' | 'record' | 'handoff';
export const rebuildStepFields: Record<RebuildStage, RebuildField[]> = {
  context: ['area', 'reality'],
  standard: ['standard'],
  structure: ['structure'],
  actions: ['actions'],
  proof: ['proof'],
  trust: ['trust', 'negotiation'],
  firstMove: ['firstMove'],
};
export type RebuildHandoff = {
  situation: string;
  action: string;
  includeSituation: boolean;
  includeAction: boolean;
};
export type RebuildSession = {
  map: Rebuild;
  step: RebuildStep;
  source: '' | 'manual' | 'saved' | 'unclear';
  reference: Standard | null;
  selectedKey: string | null;
  savedKey: string | null;
  savedRaw: string | null;
};
export const emptyRebuild = (): Rebuild => ({
  area: '',
  reality: '',
  standard: '',
  structure: '',
  actions: [''],
  proof: '',
  trust: '',
  negotiation: '',
  firstMove: '',
});
export const newRebuildSession = (): RebuildSession => ({
  map: emptyRebuild(),
  step: 'context',
  source: '',
  reference: null,
  selectedKey: null,
  savedKey: null,
  savedRaw: null,
});
export function rebuildTextError(value: unknown, limit = REBUILD_LIMIT): string {
  if (typeof value !== 'string' || !value.trim()) return 'Add your own words before continuing.';
  return value.length > limit
    ? `Keep this response within ${limit.toLocaleString('en-US')} characters. Your text has not been shortened.`
    : '';
}
export function rebuildErrors(map: Rebuild, fields = rebuildFields): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f === 'actions') {
      if (!Array.isArray(map.actions) || map.actions.length < 1 || map.actions.length > ACTION_MAX)
        errors.actions = 'Use one to five repeated actions.';
      if (Array.isArray(map.actions))
        map.actions.forEach((v, i) => {
          const error = rebuildTextError(v, ACTION_LIMIT);
          if (error) errors[`actions-${i}`] = error;
        });
    } else {
      const error = rebuildTextError(map[f]);
      if (error) errors[f] = error;
    }
  }
  return errors;
}
export function validRebuild(value: unknown): value is Rebuild {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === rebuildFields.length &&
    !Object.keys(rebuildErrors(value as Rebuild)).length
  );
}
export function hasRebuildWork(map: Rebuild): boolean {
  return rebuildFields.some((f) => (f === 'actions' ? map.actions.some(Boolean) : !!map[f]));
}
export function rebuildText(map: Rebuild): string {
  return [
    'ONLY EMPOWERMENT',
    'Rebuild Map',
    '',
    ...rebuildFields.flatMap((f) => [
      rebuildLabels[f],
      f === 'actions' ? map.actions.map((v) => `- ${v}`).join('\n') : map[f],
      '',
    ]),
    'Status',
    'Mapped',
  ].join('\n');
}
export function prepareRebuildHandoff(map: Rebuild): RebuildHandoff {
  // Exact authored text, joined for context. Never truncate to fit the receiving tool.
  return {
    situation: `${map.area}\n\n${map.reality}`,
    action: map.firstMove,
    includeSituation: true,
    includeAction: true,
  };
}
