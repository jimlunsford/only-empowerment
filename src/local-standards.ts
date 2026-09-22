import { validStandard, type Standard } from './standard-model.ts';
import { CardStorageError, MAX_RECORDS, ownedKeys, type StorageLike } from './local-cards.ts';
export const STANDARD_PREFIX = 'oe:personal-standard:v1:';
export type SavedStandard = {
  schemaVersion: 1;
  id: string;
  tool: 'build-a-standard';
  status: 'Set';
  standard: Standard;
};
export type StandardEntry = { key: string; raw: string; record: SavedStandard };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function parseStandard(raw: string | null, key: string): SavedStandard | null {
  if (!raw || raw.length > 160000) return null;
  try {
    const r = JSON.parse(raw);
    return r &&
      Object.keys(r).length === 5 &&
      r.schemaVersion === 1 &&
      typeof r.id === 'string' &&
      uuid.test(r.id) &&
      key === STANDARD_PREFIX + r.id &&
      r.tool === 'build-a-standard' &&
      r.status === 'Set' &&
      validStandard(r.standard)
      ? r
      : null;
  } catch {
    return null;
  }
}
export function saveStandard(
  storage: StorageLike,
  standard: Standard,
  prior?: { key: string; raw: string },
  id = crypto.randomUUID(),
): StandardEntry {
  if (!validStandard(standard)) throw new CardStorageError('invalid');
  const previous = prior ? parseStandard(prior.raw, prior.key) : null;
  if (prior && (!previous || storage.getItem(prior.key) !== prior.raw))
    throw new CardStorageError('changed');
  if (!prior && ownedKeys(storage).length >= MAX_RECORDS) throw new CardStorageError('full');
  const record: SavedStandard = {
    schemaVersion: 1,
    id: previous?.id || id,
    tool: 'build-a-standard',
    status: 'Set',
    standard: structuredClone(standard),
  };
  const key = STANDARD_PREFIX + record.id,
    raw = JSON.stringify(record);
  if (!parseStandard(raw, key)) throw new CardStorageError('invalid');
  storage.setItem(key, raw);
  if (storage.getItem(key) !== raw) throw new CardStorageError('verification');
  return { key, raw, record };
}
