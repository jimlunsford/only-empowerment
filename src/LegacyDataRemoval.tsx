import { useState } from 'preact/hooks';
import { ConfirmDialog } from './components/work';
import { removeConfirmedBrowserLegacyData } from './legacy-data-removal';

export function LegacyDataRemoval() {
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState('');
  function remove() {
    setConfirm(false);
    try {
      removeConfirmedBrowserLegacyData();
      setStatus(
        'Saved legacy-tool records were removed from this browser on this site, and removal was verified. The separate Standard Card draft was not cleared.',
      );
    } catch {
      setStatus(
        'Saved legacy-tool record deletion could not be verified. Some records may remain. The separate Standard Card draft was not cleared. Use your browser’s site-data controls or try again when storage is available.',
      );
    }
  }
  return (
    <section class="local-delete">
      <h2>Delete legacy tool data</h2>
      <p>
        Remove records saved by the retired tools from this browser profile on this site, including
        unreadable or unsupported records. This control does not open or display them. Close any
        older tool tabs first; an older tab could save data again.
      </p>
      <p>
        The separate memory-only PERIOD Standard Card draft is not cleared by this control. Use{' '}
        <a href="#/period/standard">Clear this draft in the card editor</a> to clear it.
      </p>
      <p>
        It does not remove clipboard copies, printouts, PDFs, screenshots, browser or OS backups,
        extension data, hosting logs, or other external copies. You can also remove this site’s
        stored data through your browser’s site settings, including when JavaScript is unavailable.
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
            All records under the retired app’s browser-storage keys on this site will be removed,
            including unreadable or unsupported records. The app cannot undo this. Unrelated
            browser-storage keys will be left alone. Close older tool tabs before continuing.
          </p>
          <p>
            The separate memory-only PERIOD Standard Card draft will not be cleared. Clipboard
            copies, PDFs, printouts, screenshots, backups, and hosting logs will not be removed.
          </p>
        </ConfirmDialog>
      )}
    </section>
  );
}
