import { validRebuild, type Rebuild } from './rebuild-model.ts';
import { CardStorageError, MAX_RECORDS, ownedKeys, type StorageLike } from './local-cards.ts';
export const REBUILD_PREFIX = 'oe:rebuild-map:v1:';
export type SavedRebuild = {
  schemaVersion: 1;
  id: string;
  tool: 'rebuild-map';
  status: 'Mapped';
  map: Rebuild;
};
export type RebuildEntry = { key: string; raw: string; record: SavedRebuild };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function parseRebuild(raw: string | null, key: string): SavedRebuild | null {
  if (!raw || raw.length > 130000) return null;
  try {
    const r = JSON.parse(raw);
    return r &&
      Object.keys(r).length === 5 &&
      r.schemaVersion === 1 &&
      typeof r.id === 'string' &&
      uuid.test(r.id) &&
      key === REBUILD_PREFIX + r.id &&
      r.tool === 'rebuild-map' &&
      r.status === 'Mapped' &&
      validRebuild(r.map)
      ? r
      : null;
  } catch {
    return null;
  }
}
export function saveRebuild(
  storage: StorageLike,
  map: Rebuild,
  prior?: { key: string; raw: string },
  id = crypto.randomUUID(),
): RebuildEntry {
  if (!validRebuild(map)) throw new CardStorageError('invalid');
  const previous = prior ? parseRebuild(prior.raw, prior.key) : null;
  if (prior && (!previous || storage.getItem(prior.key) !== prior.raw))
    throw new CardStorageError('changed');
  if (!prior && ownedKeys(storage).length >= MAX_RECORDS) throw new CardStorageError('full');
  const record: SavedRebuild = {
    schemaVersion: 1,
    id: previous?.id || id,
    tool: 'rebuild-map',
    status: 'Mapped',
    map: structuredClone(map),
  };
  const key = REBUILD_PREFIX + record.id,
    raw = JSON.stringify(record);
  if (!parseRebuild(raw, key)) throw new CardStorageError('invalid');
  storage.setItem(key, raw);
  if (storage.getItem(key) !== raw) throw new CardStorageError('verification');
  return { key, raw, record };
}
