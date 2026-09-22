import { validReset, type ResetPlan } from './reset-model.ts';
import { CardStorageError, MAX_RECORDS, ownedKeys, type StorageLike } from './local-cards.ts';
export const RESET_PREFIX = 'oe:reset-plan:v1:';
export type SavedReset = {
  schemaVersion: 1;
  id: string;
  tool: 'reset';
  status: 'Planned';
  plan: ResetPlan;
};
export type ResetEntry = { key: string; raw: string; record: SavedReset };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function parseReset(raw: string | null, key: string): SavedReset | null {
  if (!raw || raw.length > 90000) return null;
  try {
    const r = JSON.parse(raw);
    return r &&
      Object.keys(r).length === 5 &&
      r.schemaVersion === 1 &&
      typeof r.id === 'string' &&
      uuid.test(r.id) &&
      key === RESET_PREFIX + r.id &&
      r.tool === 'reset' &&
      r.status === 'Planned' &&
      validReset(r.plan)
      ? r
      : null;
  } catch {
    return null;
  }
}
export function saveReset(
  storage: StorageLike,
  plan: ResetPlan,
  prior?: { key: string; raw: string },
  id = crypto.randomUUID(),
): ResetEntry {
  if (!validReset(plan)) throw new CardStorageError('invalid');
  const previous = prior ? parseReset(prior.raw, prior.key) : null;
  if (prior && (!previous || storage.getItem(prior.key) !== prior.raw))
    throw new CardStorageError('changed');
  if (!prior && ownedKeys(storage).length >= MAX_RECORDS) throw new CardStorageError('full');
  const record: SavedReset = {
    schemaVersion: 1,
    id: previous?.id || id,
    tool: 'reset',
    status: 'Planned',
    plan: structuredClone(plan),
  };
  const key = RESET_PREFIX + record.id,
    raw = JSON.stringify(record);
  if (!parseReset(raw, key)) throw new CardStorageError('invalid');
  storage.setItem(key, raw);
  if (storage.getItem(key) !== raw) throw new CardStorageError('verification');
  return { key, raw, record };
}
