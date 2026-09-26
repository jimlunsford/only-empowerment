import { parseAction, type ActionEntry } from './local-actions.ts';
import { parseRebuild, type RebuildEntry } from './local-rebuilds.ts';
import { parseReset, type ResetEntry } from './local-resets.ts';
import { parseStandard, type StandardEntry } from './local-standards.ts';
import { validDecision, type Decision } from './decision-room-model.ts';
import {
  CardStorageError,
  MAX_RECORDS,
  ownedKeys,
  readCards,
  type StorageLike,
  type SavedEntry,
} from './local-cards.ts';
export const DECISION_PREFIX = 'oe:decision-record:v1:';
export type SavedDecision = {
  schemaVersion: 1;
  id: string;
  tool: 'decision-room';
  status: 'Decided';
  decision: Decision;
};
export type DecisionEntry = { key: string; raw: string; record: SavedDecision };
export type ArtifactEntry =
  SavedEntry | DecisionEntry | StandardEntry | ResetEntry | RebuildEntry | ActionEntry;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function parseDecision(raw: string | null, key: string): SavedDecision | null {
  if (!raw || raw.length > 200000) return null;
  try {
    const r = JSON.parse(raw);
    return r &&
      Object.keys(r).length === 5 &&
      r.schemaVersion === 1 &&
      typeof r.id === 'string' &&
      uuid.test(r.id) &&
      key === DECISION_PREFIX + r.id &&
      r.tool === 'decision-room' &&
      r.status === 'Decided' &&
      validDecision(r.decision)
      ? r
      : null;
  } catch {
    return null;
  }
}
export function readArtifacts(storage: StorageLike): {
  entries: ArtifactEntry[];
  rejected: string[];
} {
  const cards = readCards(storage),
    entries: ArtifactEntry[] = [...cards.entries],
    rejected: string[] = [];
  for (const key of cards.rejected) {
    const raw = storage.getItem(key),
      record =
        parseDecision(raw, key) ||
        parseStandard(raw, key) ||
        parseReset(raw, key) ||
        parseRebuild(raw, key) ||
        parseAction(raw, key);
    if (raw && record) {
      if (record.tool === 'decision-room') entries.push({ key, raw, record });
      else if (record.tool === 'do-it-now') entries.push({ key, raw, record });
      else if (record.tool === 'rebuild-map') entries.push({ key, raw, record });
      else if (record.tool === 'reset') entries.push({ key, raw, record });
      else entries.push({ key, raw, record });
    } else rejected.push(key);
  }
  return { entries, rejected };
}
export function saveDecision(
  storage: StorageLike,
  decision: Decision,
  prior?: { key: string; raw: string },
  id = crypto.randomUUID(),
): DecisionEntry {
  if (!validDecision(decision)) throw new CardStorageError('invalid');
  const previous = prior ? parseDecision(prior.raw, prior.key) : null;
  if (prior && (!previous || storage.getItem(prior.key) !== prior.raw))
    throw new CardStorageError('changed');
  if (!prior && ownedKeys(storage).length >= MAX_RECORDS) throw new CardStorageError('full');
  const record: SavedDecision = {
    schemaVersion: 1,
    id: previous?.id || id,
    tool: 'decision-room',
    status: 'Decided',
    decision: structuredClone(decision),
  };
  const key = DECISION_PREFIX + record.id,
    raw = JSON.stringify(record);
  if (!parseDecision(raw, key)) throw new CardStorageError('invalid');
  storage.setItem(key, raw);
  if (storage.getItem(key) !== raw) throw new CardStorageError('verification');
  return { key, raw, record };
}
