import { useEffect, useState } from 'preact/hooks';
import { PageIntro } from './components/shared';
import { ConfirmDialog } from './components/work';
import { browserStorage, deleteAll, deleteCard, type SavedEntry } from './local-cards';
import { newSession } from './next-move-model';
import { broadcast, type LocalWork } from './use-local-work';
export function LocalDataControls({ work }: { work: LocalWork }) {
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState('');
  function remove() {
    setConfirm(false);
    // Clear memory even when storage is denied; never imply persisted removal succeeded.
    work.clearEvent({ type: 'delete-all' });
    broadcast({ type: 'delete-all' });
    try {
      deleteAll(browserStorage());
      work.refresh();
      broadcast({ type: 'delete-all' });
      setStatus(
        'All Only Empowerment local data was removed and removal was verified. Current work was cleared.',
      );
    } catch {
      work.refresh();
      setStatus(
        'Current work was cleared, but local storage deletion could not be verified. Some records may remain. Use your browser’s site-data controls or try again when storage is available.',
      );
    }
  }
  return (
    <section class="local-delete">
      <h2>Delete my local data</h2>
      <p>
        Remove all Only Empowerment records from this browser profile, including unreadable records
        and other schema versions. This also clears current work in open app tabs where browser
        synchronization is available.
      </p>
      <p>
        It does not remove clipboard copies, printouts, PDFs, screenshots, browser or OS backups,
        extension data, or other external copies.
      </p>
      <button class="button" onClick={() => setConfirm(true)}>
        Delete my local data
      </button>
      <p role="status">{status}</p>
      {confirm && (
        <ConfirmDialog
          title="Delete all local data?"
          confirm="Delete all Only Empowerment data"
          onCancel={() => setConfirm(false)}
          onConfirm={remove}
        >
          <p>
            All Only Empowerment saved cards and current work will be cleared from this browser
            profile. The app cannot undo this. Unrelated site data will be left alone.
          </p>
        </ConfirmDialog>
      )}
    </section>
  );
}
export function SavedWork({ work }: { work: LocalWork }) {
  useEffect(() => {
    work.refresh();
  }, []);
  const [deleting, setDeleting] = useState<SavedEntry | null>(null);
  const [opening, setOpening] = useState<SavedEntry | null>(null);
  const [status, setStatus] = useState('');
  useEffect(() => {
    setOpening(null);
    setDeleting(null);
  }, [work.clearEpoch]);
  useEffect(() => {
    if (opening && !work.entries.some((entry) => entry.key === opening.key)) setOpening(null);
    if (deleting && !work.entries.some((entry) => entry.key === deleting.key)) setDeleting(null);
  }, [work.entries]);
  function open(entry: SavedEntry) {
    try {
      if (browserStorage().getItem(entry.key) !== entry.raw) {
        work.refresh();
        setStatus('That record changed. Choose it again from the refreshed list.');
        return;
      }
    } catch {
      setStatus('This saved card could not be read. Browser storage is unavailable.');
      return;
    }
    work.setSession({
      ...newSession(),
      card: { ...entry.record.card },
      step: 'card',
      readiness: 'ready',
      obstacleKind: 'friction',
      savedKey: entry.key,
      savedRaw: entry.raw,
    });
    setOpening(null);
    location.hash = '/tools/next-move';
  }
  function remove(entry: SavedEntry) {
    setDeleting(null);
    try {
      deleteCard(browserStorage(), entry.key);
      work.clearEvent({ type: 'delete-one', key: entry.key });
      broadcast({ type: 'delete-one', key: entry.key });
      setStatus('Card deleted. Removal was verified.');
    } catch {
      work.refresh();
      setStatus(
        'Deletion could not be verified. The record may still be saved. Try again or use browser site-data controls.',
      );
    }
  }
  return (
    <div class="narrow">
      <PageIntro label="Local work" title="Saved on this device">
        <p>
          Execution Cards in this browser profile only. There is no account or cloud recovery. Open
          a card to edit, copy, or print it.
        </p>
      </PageIntro>
      {work.storageError && (
        <p class="error" role="alert">
          {work.storageError}
        </p>
      )}
      {work.rejected.length > 0 && (
        <p class="storage-notice" role="status">
          {work.rejected.length} unreadable or unsupported record(s) were left untouched. They
          cannot be opened by this version. Delete my local data removes them too.
        </p>
      )}
      {work.entries.length === 0 ? (
        <section class="empty-state">
          <h2>No saved Execution Cards.</h2>
          <p>Work stays in memory unless you choose “Save on this device” on a finished card.</p>
          <a class="button primary" href="#/tools/next-move">
            Open Next Move
          </a>
        </section>
      ) : (
        <ul class="saved-list">
          {work.entries.map((entry, index) => (
            <li key={entry.key}>
              <div>
                <p class="eyebrow">Execution Card {index + 1} · Planned</p>
                <h2>{entry.record.card.situation}</h2>
                <p class="saved-action">{entry.record.card.action}</p>
              </div>
              <div class="actions">
                <button
                  class="button"
                  aria-label={`Open Execution Card ${index + 1}`}
                  onClick={() => {
                    if (Object.values(work.session.card).some(Boolean)) setOpening(entry);
                    else open(entry);
                  }}
                >
                  Open card
                </button>
                <button
                  class="text-button"
                  aria-label={`Delete Execution Card ${index + 1}`}
                  onClick={() => setDeleting(entry)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p role="status">{status}</p>
      <LocalDataControls work={work} />
      {deleting && (
        <ConfirmDialog
          title="Delete this Execution Card?"
          confirm="Delete this card"
          onCancel={() => setDeleting(null)}
          onConfirm={() => remove(deleting)}
        >
          <p>
            This removes this saved card and clears open app copies of it where synchronization is
            available. Other saved cards stay.
          </p>
        </ConfirmDialog>
      )}
      {opening && (
        <ConfirmDialog
          title="Replace current in-memory work?"
          confirm="Open saved card"
          onCancel={() => setOpening(null)}
          onConfirm={() => open(opening)}
        >
          <p>
            Opening this card replaces the current Next Move session. Copy or save any work you want
            to keep first. Your other saved records will stay.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
