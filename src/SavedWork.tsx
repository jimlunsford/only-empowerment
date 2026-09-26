import { newActionSession, hasActionWork } from './do-it-now-model';
import { newRebuildSession, hasRebuildWork } from './rebuild-model';
import { newResetSession } from './reset-model';
import { newStandardSession, hasStandardWork } from './standard-model';
import { useEffect, useState } from 'preact/hooks';
import { PageIntro } from './components/shared';
import { ConfirmDialog } from './components/work';
import { browserStorage, deleteAll, deleteCard } from './local-cards';
import { type ArtifactEntry } from './local-decisions';
import { newDecisionSession, decisionFields } from './decision-room-model';
import { newSession } from './next-move-model';
import { broadcast, type LocalWork } from './use-local-work';
const artifactName = (entry: ArtifactEntry) =>
  entry.record.tool === 'do-it-now'
    ? 'Action Record'
    : entry.record.tool === 'next-move'
      ? 'Execution Card'
      : entry.record.tool === 'decision-room'
        ? 'Decision Record'
        : entry.record.tool === 'reset'
          ? 'Reset Plan'
          : entry.record.tool === 'rebuild-map'
            ? 'Rebuild Map'
            : 'Personal Standard';
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
            All Only Empowerment saved records and current work will be cleared from this browser
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
  const [deleting, setDeleting] = useState<ArtifactEntry | null>(null);
  const [opening, setOpening] = useState<ArtifactEntry | null>(null);
  const [status, setStatus] = useState('');
  useEffect(() => {
    setOpening(null);
    setDeleting(null);
  }, [work.clearEpoch]);
  useEffect(() => {
    if (opening && !work.entries.some((entry) => entry.key === opening.key)) setOpening(null);
    if (deleting && !work.entries.some((entry) => entry.key === deleting.key)) setDeleting(null);
  }, [work.entries]);
  function open(entry: ArtifactEntry) {
    try {
      if (browserStorage().getItem(entry.key) !== entry.raw) {
        work.refresh();
        setStatus('That record changed. Choose it again from the refreshed list.');
        return;
      }
    } catch {
      setStatus('This saved record could not be read. Browser storage is unavailable.');
      return;
    }
    if (entry.record.tool === 'do-it-now') {
      work.setActionSession({
        ...newActionSession(),
        ...entry.record.record,
        started: true,
        result: entry.record.status,
        step: 'record',
        savedKey: entry.key,
        savedRaw: entry.raw,
      });
      setOpening(null);
      location.hash = '/tools/do-it-now';
      return;
    }
    if (entry.record.tool === 'rebuild-map') {
      work.setRebuildSession({
        ...newRebuildSession(),
        map: structuredClone(entry.record.map),
        step: 'record',
        source: 'manual',
        savedKey: entry.key,
        savedRaw: entry.raw,
      });
      setOpening(null);
      location.hash = '/tools/rebuild-map';
      return;
    }
    if (entry.record.tool === 'reset') {
      work.setResetSession({
        ...newResetSession(),
        plan: structuredClone(entry.record.plan),
        step: 'record',
        source: 'manual',
        standing: 'stands',
        checkedStandard: entry.record.plan.standard,
        savedKey: entry.key,
        savedRaw: entry.raw,
      });
      setOpening(null);
      location.hash = '/tools/reset';
      return;
    }
    if (entry.record.tool === 'build-a-standard') {
      work.setStandardSession({
        ...newStandardSession(),
        standard: structuredClone(entry.record.standard),
        step: 'record',
        savedKey: entry.key,
        savedRaw: entry.raw,
      });
      setOpening(null);
      location.hash = '/tools/build-a-standard';
      return;
    }
    if (entry.record.tool === 'decision-room') {
      work.setDecisionSession({
        ...newDecisionSession(),
        decision: structuredClone(entry.record.decision),
        step: 'record',
        readiness: 'ready',
        savedKey: entry.key,
        savedRaw: entry.raw,
      });
      setOpening(null);
      location.hash = '/tools/decision-room';
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
  function remove(entry: ArtifactEntry) {
    setDeleting(null);
    try {
      deleteCard(browserStorage(), entry.key);
      work.clearEvent({ type: 'delete-one', key: entry.key });
      broadcast({ type: 'delete-one', key: entry.key });
      setStatus(
        entry.record.tool === 'next-move'
          ? 'Card deleted. Removal was verified.'
          : `${artifactName(entry)} deleted. Removal was verified.`,
      );
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
          Execution Cards, Decision Records, Personal Standards, Reset Plans, Rebuild Maps, and
          Action Records in this browser profile only. There is no account or cloud recovery. Open a
          record to edit, copy, or print it. Up to 50 saved Only Empowerment records total.
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
          <h2>No saved work.</h2>
          <p>
            Work stays in memory unless you choose “Save on this device” on a confirmed artifact.
          </p>
          <div class="actions">
            <a class="button" href="#/tools/decision-room">
              Open Decision Room
            </a>
            <a class="button" href="#/tools/build-a-standard">
              Open Build a Standard
            </a>
            <a class="button" href="#/tools/next-move">
              Open Next Move
            </a>
          </div>
        </section>
      ) : (
        <ul class="saved-list">
          {work.entries.map((entry, index) => {
            const type = artifactName(entry);
            const situation =
              entry.record.tool === 'do-it-now'
                ? entry.record.record.task
                : entry.record.tool === 'next-move'
                  ? entry.record.card.situation
                  : entry.record.tool === 'decision-room'
                    ? entry.record.decision.decision
                    : entry.record.tool === 'reset'
                      ? entry.record.plan.slip
                      : entry.record.tool === 'rebuild-map'
                        ? entry.record.map.area
                        : entry.record.standard.area;
            const action =
              entry.record.tool === 'do-it-now'
                ? entry.record.record.outcome
                : entry.record.tool === 'next-move'
                  ? entry.record.card.action
                  : entry.record.tool === 'decision-room'
                    ? entry.record.decision.firstMove
                    : entry.record.tool === 'reset'
                      ? entry.record.plan.proof
                      : entry.record.tool === 'rebuild-map'
                        ? entry.record.map.firstMove
                        : entry.record.standard.standard;
            return (
              <li key={entry.key}>
                <div>
                  <p class="eyebrow">
                    {type} {index + 1} · {entry.record.status}
                  </p>
                  <h2>{situation}</h2>
                  <p class="saved-action">{action}</p>
                </div>
                <div class="actions">
                  <button
                    class="button"
                    aria-label={`Open ${type} ${index + 1}`}
                    onClick={() => {
                      if (
                        entry.record.tool === 'do-it-now'
                          ? hasActionWork(work.actionSession)
                          : entry.record.tool === 'next-move'
                            ? Object.values(work.session.card).some(Boolean) ||
                              !!work.session.readiness ||
                              !!work.session.obstacleKind
                            : entry.record.tool === 'rebuild-map'
                              ? hasRebuildWork(work.rebuildSession.map) ||
                                !!work.rebuildSession.source
                              : entry.record.tool === 'reset'
                                ? Object.values(work.resetSession.plan).some(Boolean) ||
                                  !!work.resetSession.source
                                : entry.record.tool === 'build-a-standard'
                                  ? hasStandardWork(work.standardSession.standard)
                                  : decisionFields.some(
                                      (f) => !!work.decisionSession.decision[f],
                                    ) ||
                                    work.decisionSession.decision.options.some(
                                      (o) => !!o.label || !!o.tradeoff,
                                    ) ||
                                    !!work.decisionSession.readiness
                      )
                        setOpening(entry);
                      else open(entry);
                    }}
                  >
                    {entry.record.tool === 'next-move'
                      ? 'Open card'
                      : entry.record.tool === 'build-a-standard'
                        ? 'Open standard'
                        : 'Open record'}
                  </button>
                  <button
                    class="text-button"
                    aria-label={`Delete ${type} ${index + 1}`}
                    onClick={() => setDeleting(entry)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p role="status">{status}</p>
      <LocalDataControls work={work} />
      {deleting && (
        <ConfirmDialog
          title={
            deleting.record.tool === 'next-move'
              ? 'Delete this Execution Card?'
              : `Delete this ${artifactName(deleting)}?`
          }
          confirm={
            deleting.record.tool === 'next-move'
              ? 'Delete this card'
              : deleting.record.tool === 'build-a-standard'
                ? 'Delete this standard'
                : 'Delete this record'
          }
          onCancel={() => setDeleting(null)}
          onConfirm={() => remove(deleting)}
        >
          <p>
            This removes this saved record and clears open app copies of it where synchronization is
            available. Other saved records stay.
          </p>
        </ConfirmDialog>
      )}
      {opening && (
        <ConfirmDialog
          title="Replace current in-memory work?"
          confirm={
            opening.record.tool === 'next-move'
              ? 'Open saved card'
              : opening.record.tool === 'build-a-standard'
                ? 'Open saved standard'
                : 'Open saved record'
          }
          onCancel={() => setOpening(null)}
          onConfirm={() => open(opening)}
        >
          <p>
            Opening this record replaces the current{' '}
            {opening.record.tool === 'do-it-now'
              ? 'Do It Now'
              : opening.record.tool === 'next-move'
                ? 'Next Move'
                : opening.record.tool === 'build-a-standard'
                  ? 'Build a Standard'
                  : opening.record.tool === 'reset'
                    ? 'Reset'
                    : opening.record.tool === 'rebuild-map'
                      ? 'Rebuild Map'
                      : 'Decision Room'}{' '}
            session. Copy or save any work you want to keep first. Your other saved records will
            stay.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
