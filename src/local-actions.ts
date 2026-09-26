import {
  validActionRecord,
  validActionStatus,
  type ActionRecord,
  type ActionStatus,
} from './do-it-now-model.ts';
import { CardStorageError, MAX_RECORDS, ownedKeys, type StorageLike } from './local-cards.ts';
export const ACTION_PREFIX = 'oe:action-record:v1:';
export type SavedAction = {
  schemaVersion: 1;
  id: string;
  tool: 'do-it-now';
  status: ActionStatus;
  record: ActionRecord;
};
export type ActionEntry = { key: string; raw: string; record: SavedAction };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function parseAction(raw: string | null, key: string): SavedAction | null {
  if (!raw || raw.length > 40000) return null;
  try {
    const r = JSON.parse(raw);
    return r &&
      Object.keys(r).length === 5 &&
      r.schemaVersion === 1 &&
      typeof r.id === 'string' &&
      uuid.test(r.id) &&
      key === ACTION_PREFIX + r.id &&
      r.tool === 'do-it-now' &&
      validActionStatus(r.status) &&
      validActionRecord(r.record)
      ? r
      : null;
  } catch {
    return null;
  }
}
export function saveAction(
  storage: StorageLike,
  record: ActionRecord,
  status: ActionStatus,
  prior?: { key: string; raw: string },
  id = crypto.randomUUID(),
): ActionEntry {
  if (!validActionRecord(record) || !validActionStatus(status))
    throw new CardStorageError('invalid');
  const previous = prior ? parseAction(prior.raw, prior.key) : null;
  if (prior && (!previous || storage.getItem(prior.key) !== prior.raw))
    throw new CardStorageError('changed');
  if (!prior && ownedKeys(storage).length >= MAX_RECORDS) throw new CardStorageError('full');
  const saved: SavedAction = {
    schemaVersion: 1,
    id: previous?.id || id,
    tool: 'do-it-now',
    status,
    record: structuredClone(record),
  };
  const key = ACTION_PREFIX + saved.id,
    raw = JSON.stringify(saved);
  if (!parseAction(raw, key)) throw new CardStorageError('invalid');
  storage.setItem(key, raw);
  if (storage.getItem(key) !== raw) throw new CardStorageError('verification');
  return { key, raw, record: saved };
}
