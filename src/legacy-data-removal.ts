// The historical app owns the oe: namespace, including unsupported record versions.
// No record values are read, parsed, migrated, exported, or written by this service.
type RemovalStorage = Pick<Storage, 'length' | 'key' | 'removeItem'>;
function legacyKeys(storage: RemovalStorage): string[] {
  return Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
    (key): key is string => key !== null && key.startsWith('oe:'),
  );
}
export function removeLegacyData(storage: RemovalStorage) {
  for (const key of legacyKeys(storage)) storage.removeItem(key);
  if (legacyKeys(storage).length) throw new Error('removal-unverified');
}
// Called only by the confirmation action. Never accessed during mounting or navigation.
export function removeConfirmedBrowserLegacyData() {
  removeLegacyData(window.localStorage);
}
