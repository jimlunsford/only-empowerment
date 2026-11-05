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
        'All saved legacy-tool records were removed from this browser on this site, and removal was verified. Current legacy-tool work was cleared. The separate Standard Card draft was not cleared.',
      );
    } catch {
      work.refresh();
      setStatus(
        'Current legacy-tool work was cleared, but saved legacy-tool record deletion could not be verified. Some records may remain. The separate Standard Card draft was not cleared. Use your browser’s site-data controls or try again when storage is available.',
      );
    }
  }
  return (
    <section class="local-delete">
      <h2>Delete legacy tool data</h2>
      <p>
        Remove all saved legacy-tool records from this browser profile on this site, including
        unreadable or unsupported records. This also clears current legacy-tool sessions in open app
        tabs where browser synchronization is available.
      </p>
      <p>
        The separate memory-only PERIOD Standard Card draft is not cleared by this control. Use{' '}
        <a href="#/period/standard">Clear this draft in the card editor</a> to clear it.
      </p>
      <p>
        It does not remove clipboard copies, printouts, PDFs, screenshots, browser or OS backups,
        extension data, hosting logs, or other external copies.
      </p>
      <button class="button" onClick={() => setConfirm(true)}>
        Delete legacy tool data
      </button>
      <p role="status">{status}</p>
      {confirm && (
        <ConfirmDialog
          title="Delete legacy tool data?"
          confirm="Delete legacy tool data"
          onCancel={() => setConfirm(false)}
          onConfirm={remove}
        >
          <p>
            All saved legacy-tool records under this app’s existing browser-storage keys on this
            site will be removed, including unreadable or unsupported records. Current legacy-tool
            sessions will also be cleared in open app tabs where browser synchronization is
            available. The app cannot undo this. Unrelated browser-storage keys will be left alone.
          </p>
          <p>
            The separate memory-only PERIOD Standard Card draft will not be cleared. Use the card
            editor’s own Clear this draft action to clear it. Clipboard copies, PDFs, printouts,
            screenshots, backups, and hosting logs will not be removed.
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
    <div class="narrow legacy-info">
      <PageIntro title="Saved work">
        <p>
          Records you chose to save with the legacy tools, in this browser profile and on this site
          only. Open a record to edit, copy, or print it. There is no account, cloud recovery, or
          transfer between staging and production. Up to 50 saved records total.
        </p>
        <div class="legacy-card-note">
          <p>
            The optional PERIOD Standard Card is not saved here. Its draft stays only in the open
            tab. Return to the card in that tab to copy, print, or clear it.
          </p>
        </div>
        <nav class="legacy-links" aria-label="Saved work navigation">
          <a href="#/tools">Open legacy tools</a>
          <a href="#/privacy">Read Privacy &amp; source</a>
        </nav>
      </PageIntro>
      {work.storageError && (
        <p class="error" role="alert">
          {work.storageError}
        </p>
      )}
      {work.rejected.length > 0 && (
        <p class="storage-notice" role="status">
          {work.rejected.length} unreadable or unsupported record(s) were left untouched. They
          cannot be opened by this version. Delete legacy tool data removes them too.
        </p>
      )}
      {work.entries.length === 0 ? (
        <section class="empty-state">
          <h2>No saved work in this browser on this site.</h2>
          <p>
            Legacy tool work appears here only after you choose Save on this device. Your Standard
            Card draft is separate.
          </p>
          <div class="actions">
            <a class="button" href="#/tools">
              Open legacy tools
            </a>
            <a href="#/period/teaching-order">Explore the values</a>
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
                  <h2>{situation}</h2>
                  <p class="saved-metadata">
                    {type} · {entry.record.status}
                  </p>
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
