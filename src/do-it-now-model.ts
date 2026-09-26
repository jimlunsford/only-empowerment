import type { FutureHandoff } from './next-move-model.ts';
export const actionFields = ['task', 'firstAction', 'outcome'] as const;
export type ActionField = (typeof actionFields)[number];
export const actionLabels = {
  task: 'Known task',
  firstAction: 'Smallest real action',
  outcome: 'What happened',
};
export const resultChoices = ['Completed', 'Partial', 'Blocked'] as const;
export type ActionStatus = (typeof resultChoices)[number];
export const resultPrompts: Record<ActionStatus, string> = {
  Completed: 'What happened that tells you it is complete?',
  Partial: 'What did you complete, and what remains?',
  Blocked: 'What blocked the action after you began?',
};
export type ActionRecord = Record<ActionField, string> & { beginState: 'Started' };
export function actionError(value: string) {
  if (!value.trim()) return 'Add this in your own words.';
  return value.length > 2000
    ? 'Use 2,000 characters or fewer. Your text has not been shortened.'
    : '';
}
export function validActionStatus(value: unknown): value is ActionStatus {
  return resultChoices.some((choice) => choice === value);
}
export function validActionRecord(value: unknown): value is ActionRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  return (
    Object.keys(r).length === 4 &&
    r.beginState === 'Started' &&
    actionFields.every((f) => typeof r[f] === 'string' && !actionError(r[f]))
  );
}
export function actionText(record: ActionRecord, status: ActionStatus) {
  return [
    'ONLY EMPOWERMENT',
    'Action Record',
    '',
    'Known task',
    record.task,
    '',
    'Smallest real action',
    record.firstAction,
    '',
    'Begin state',
    'Started',
    '',
    'What happened',
    record.outcome,
    '',
    'Status',
    status,
    '',
    'User-reported result after beginning the action.',
  ].join('\n');
}
export type ActionStep = 'task' | 'begin' | 'pause' | 'result' | 'review' | 'record';
export type ActionSession = {
  step: ActionStep;
  task: string;
  firstAction: string;
  outcome: string;
  readiness: '' | 'yes' | 'no';
  started: boolean;
  result: ActionStatus | '';
  timerMinutes: string;
  timerStartedAt: number | null;
  reference: FutureHandoff | null;
  savedKey: string | null;
  savedRaw: string | null;
};
export const newActionSession = (): ActionSession => ({
  step: 'task',
  task: '',
  firstAction: '',
  outcome: '',
  readiness: '',
  started: false,
  result: '',
  timerMinutes: '',
  timerStartedAt: null,
  reference: null,
  savedKey: null,
  savedRaw: null,
});
export function hasActionWork(s: ActionSession) {
  return !!(
    s.task ||
    s.firstAction ||
    s.outcome ||
    s.readiness ||
    s.started ||
    s.timerMinutes ||
    s.reference ||
    s.savedKey
  );
}
export function timerValid(value: string) {
  return value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 60);
}
export function remainingSeconds(start: number, minutes: number, now: number) {
  return Math.max(0, Math.ceil((start + minutes * 60000 - now) / 1000));
}
export function actionFromSession(s: ActionSession): ActionRecord | null {
  const r = {
    task: s.task,
    firstAction: s.firstAction,
    outcome: s.outcome,
    beginState: 'Started' as const,
  };
  return s.started && validActionStatus(s.result) && validActionRecord(r) ? r : null;
}
// Consume the accepted Next Move contract without adding a transport or interpreting its text.
export function receiveActionHandoff(h: FutureHandoff): ActionSession | null {
  if (
    h.source !== 'next-move' ||
    h.target !== 'do-it-now' ||
    h.status !== 'Planned' ||
    typeof h.fields.action !== 'string' ||
    actionError(h.fields.action) ||
    Object.keys(h.fields).some((f) => !['action', 'start', 'completion'].includes(f))
  )
    return null;
  for (const f of ['start', 'completion'] as const) {
    const value = h.fields[f];
    if (
      value !== undefined &&
      (typeof value !== 'string' || !value.trim() || value.length > (f === 'start' ? 1000 : 2000))
    )
      return null;
  }
  return { ...newActionSession(), task: h.fields.action, reference: structuredClone(h) };
}
