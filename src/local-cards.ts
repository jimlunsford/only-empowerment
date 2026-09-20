import { validCard, type Card } from './next-move-model.ts';
export class CardStorageError extends Error {}
export const PREFIX = 'oe:';
export const CARD_PREFIX = 'oe:execution-card:v1:';
export const MAX_RECORDS = 50;
const MAX_BYTES = 60000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export type SavedRecord = {
  schemaVersion: 1;
  id: string;
  tool: 'next-move';
  status: 'Planned';
  card: Card;
};
export type SavedEntry = { key: string; raw: string; record: SavedRecord };
export type StorageLike = Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem' | 'removeItem'>;
export const browserStorage = (): StorageLike => window.localStorage;
export function parseRecord(raw: string | null, key: string): SavedRecord | null {
  if (!raw || raw.length > MAX_BYTES) return null;
  try {
    const r = JSON.parse(raw);
    return r &&
      Object.keys(r).length === 5 &&
      r.schemaVersion === 1 &&
      uuid.test(r.id) &&
      key === CARD_PREFIX + r.id &&
      r.tool === 'next-move' &&
      r.status === 'Planned' &&
      validCard(r.card)
      ? r
      : null;
  } catch {
    return null;
  }
}
export function ownedKeys(storage: StorageLike): string[] {
  return Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
    (k): k is string => !!k && k.startsWith(PREFIX),
  );
}
export function readCards(storage: StorageLike): { entries: SavedEntry[]; rejected: string[] } {
  const entries: SavedEntry[] = [],
    rejected: string[] = [];
  for (const key of ownedKeys(storage)) {
    const raw = storage.getItem(key);
    const record = parseRecord(raw, key);
    if (record && raw) entries.push({ key, raw, record });
    else rejected.push(key);
  }
  return { entries, rejected };
}
export function saveCard(
  storage: StorageLike,
  card: Card,
  prior?: { key: string; raw: string },
  id = crypto.randomUUID(),
): SavedEntry {
  if (!validCard(card)) throw new CardStorageError('invalid');
  if (prior && storage.getItem(prior.key) !== prior.raw) throw new CardStorageError('changed');
  if (!prior && ownedKeys(storage).length >= MAX_RECORDS) throw new CardStorageError('full');
  const record: SavedRecord = {
    schemaVersion: 1,
    id: prior ? parseRecord(prior.raw, prior.key)!.id : id,
    tool: 'next-move',
    status: 'Planned',
    card: { ...card },
  };
  const key = CARD_PREFIX + record.id,
    raw = JSON.stringify(record);
  if (!parseRecord(raw, key)) throw new CardStorageError('invalid');
  storage.setItem(key, raw);
  if (storage.getItem(key) !== raw) throw new CardStorageError('verification');
  return { key, raw, record };
}
export function deleteCard(storage: StorageLike, key: string) {
  if (!key.startsWith(PREFIX)) throw new CardStorageError('scope');
  storage.removeItem(key);
  if (storage.getItem(key) !== null) throw new CardStorageError('verification');
}
export function deleteAll(storage: StorageLike) {
  for (const key of ownedKeys(storage)) storage.removeItem(key);
  if (ownedKeys(storage).length) throw new CardStorageError('verification');
}
