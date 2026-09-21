import { useEffect, useState } from 'preact/hooks';
import { browserStorage, readCards, PREFIX, type SavedEntry } from './local-cards';
import { newSession, type Session } from './next-move-model';
export type LocalEvent =
  { type: 'delete-all' } | { type: 'delete-one'; key: string } | { type: 'refresh' };
const CHANNEL = 'oe:local-data';
export function broadcast(event: LocalEvent) {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage(event);
    channel.close();
  } catch {
    /* storage events remain available */
  }
}
export function useLocalWork() {
  const [session, setSession] = useState<Session>(newSession);
  const [entries, setEntries] = useState<SavedEntry[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [storageError, setStorageError] = useState('');
  const [notice, setNotice] = useState('');
  const [clearEpoch, setClearEpoch] = useState(0);
  function refresh() {
    try {
      const result = readCards(browserStorage());
      setEntries(result.entries);
      setRejected(result.rejected);
      setStorageError('');
    } catch {
      setEntries([]);
      setRejected([]);
      setStorageError(
        'Browser storage is unavailable. You can still work in memory, copy, and print.',
      );
    }
  }
  function clearEvent(event: LocalEvent) {
    if (event.type === 'delete-all') {
      setClearEpoch((value) => value + 1);
      setSession(newSession());
      setNotice('Local data and current Next Move work were cleared.');
    } else if (event.type === 'delete-one') {
      setSession((old) => (old.savedKey === event.key ? newSession() : old));
      setNotice('A saved card was deleted. Any open copy of that record was cleared.');
    }
    refresh();
  }
  useEffect(() => {
    refresh();
    const storage = (event: StorageEvent) => {
      if (event.key === null) {
        clearEvent({ type: 'delete-all' });
        return;
      }
      if (!event.key.startsWith(PREFIX)) return;
      if (event.newValue === null) clearEvent({ type: 'delete-one', key: event.key });
      else {
        setSession((old) =>
          old.savedKey === event.key && old.savedRaw !== event.newValue
            ? { ...old, savedRaw: null }
            : old,
        );
        refresh();
      }
    };
    let channel: BroadcastChannel | undefined;
    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (e) => {
        const message = e.data;
        if (
          message?.type === 'delete-all' ||
          message?.type === 'refresh' ||
          (message?.type === 'delete-one' &&
            typeof message.key === 'string' &&
            message.key.startsWith(PREFIX))
        )
          clearEvent(message);
      };
    } catch {
      /* Same-origin storage events synchronize persisted deletion. */
    }
    const visible = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        setSession((old) => {
          if (!old.savedKey) return old;
          try {
            const current = browserStorage().getItem(old.savedKey);
            if (current === null) return newSession();
            if (current !== old.savedRaw) return { ...old, savedRaw: null };
          } catch {
            return { ...old, savedRaw: null };
          }
          return old;
        });
      }
    };
    window.addEventListener('storage', storage);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('storage', storage);
      document.removeEventListener('visibilitychange', visible);
      channel?.close();
    };
  }, []);
  return {
    clearEpoch,
    session,
    setSession,
    entries,
    rejected,
    storageError,
    notice,
    setNotice,
    refresh,
    clearEvent,
  };
}
export type LocalWork = ReturnType<typeof useLocalWork>;
