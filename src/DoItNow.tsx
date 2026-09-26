import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { SourceNote } from './components/shared';
import { ConfirmDialog, LocalNotice, TextResponse } from './components/work';
import { renderStandardText } from './components/artifact-text';
import {
  actionError,
  actionFields,
  actionFromSession,
  actionLabels,
  actionText,
  newActionSession,
  remainingSeconds,
  resultChoices,
  resultPrompts,
  timerValid,
  type ActionField,
  type ActionStep,
  type ActionStatus,
  type ActionRecord,
} from './do-it-now-model';
import { actionLessons } from './do-it-now-lessons';
import { browserStorage, CardStorageError } from './local-cards';
import { saveAction } from './local-actions';
import { broadcast, type LocalWork } from './use-local-work';

function RecordView({ record, status }: { record: ActionRecord; status: ActionStatus }) {
  return (
    <article class="output-card" aria-labelledby="action-record-title">
      <div class="artifact-header">
        <p class="eyebrow">Only Empowerment · Do It Now</p>
        <span class="planned-badge">Status: {status}</span>
      </div>
      <h2 id="action-record-title">Action Record</h2>
      {(['task', 'firstAction', 'beginState', 'outcome'] as const).map((f) => (
        <section class="artifact-section" key={f}>
          <h3>{f === 'beginState' ? 'Begin state' : actionLabels[f]}</h3>
          <p class="answer">{renderStandardText(record[f])}</p>
        </section>
      ))}
      <p class="artifact-footnote">
        User-reported result after beginning the action. This record does not independently verify
        completion.
      </p>
      <p class="print-only">
        Based on Pure Execution Mode · jimlunsford.com/pure-execution-mode/
        <br />
        Built by Jim Lunsford · jimlunsford.com
      </p>
    </article>
  );
}
export function DoItNow({ work }: { work: LocalWork }) {
  const { actionSession: session, setActionSession: setSession } = work;
  const { step } = session;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [dialog, setDialog] = useState<'save' | 'clear' | null>(null);
  const [fallback, setFallback] = useState(false);
  const [now, setNow] = useState(Date.now());
  const heading = useRef<HTMLHeadingElement>(null),
    copyArea = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    heading.current?.focus();
    setErrors({});
    setNotice('');
    setFallback(false);
  }, [step]);
  useEffect(() => {
    if (fallback) {
      copyArea.current?.focus();
      copyArea.current?.select();
    }
  }, [fallback]);
  useEffect(() => {
    if (step === 'task' && !session.task) {
      setDialog(null);
      setFallback(false);
      setNotice('');
    }
  }, [session]);
  useEffect(() => {
    if (session.timerStartedAt === null || step !== 'result') return;
    const tick = () => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [session.timerStartedAt, step]);
  const remaining =
    session.timerStartedAt === null
      ? null
      : remainingSeconds(session.timerStartedAt, Number(session.timerMinutes), now);
  const record = actionFromSession(session);
  function go(next: ActionStep) {
    setSession((old) => ({ ...old, step: next }));
  }
  function edit(f: ActionField, value: string) {
    setSession((old) => ({ ...old, [f]: value }));
    setErrors((old) => ({ ...old, [f]: '' }));
  }
  function check(fields: readonly ActionField[]) {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const error = actionError(session[f]);
      if (error) next[f] = error;
    }
    setErrors(next);
    const first = fields.find((f) => next[f]);
    if (first) document.getElementById('din-' + first)?.focus();
    return !first;
  }
  function begin() {
    if (session.started || !check(['task', 'firstAction'])) return;
    if (!session.readiness) {
      setErrors({ readiness: 'Choose whether this action can begin now.' });
      document.getElementById('din-yes')?.focus();
      return;
    }
    if (session.readiness === 'no') {
      go('pause');
      return;
    }
    if (!timerValid(session.timerMinutes)) {
      setErrors({ timer: 'Choose a whole number from 1 to 60 minutes, or turn the timer off.' });
      document.getElementById('din-minutes')?.focus();
      return;
    }
    setSession((old) => ({
      ...old,
      started: true,
      step: 'result',
      timerStartedAt: old.timerMinutes ? Date.now() : null,
    }));
  }
  async function copy() {
    if (!record || !session.result) return;
    try {
      await navigator.clipboard.writeText(actionText(record, session.result));
      setNotice('Action Record copied.');
      setFallback(false);
    } catch {
      setNotice('Copy was blocked. Select and copy the plain text below.');
      setFallback(true);
    }
  }
  function save() {
    setDialog(null);
    if (!record || !session.result || step !== 'record') return;
    try {
      if (session.savedKey && !session.savedRaw) throw new CardStorageError('changed');
      const entry = saveAction(
        browserStorage(),
        record,
        session.result,
        session.savedKey && session.savedRaw
          ? { key: session.savedKey, raw: session.savedRaw }
          : undefined,
      );
      setSession((old) => ({ ...old, savedKey: entry.key, savedRaw: entry.raw }));
      work.refresh();
      broadcast({ type: 'refresh' });
      setNotice('Saved on this device.');
    } catch (error) {
      const code = error instanceof CardStorageError ? error.message : '';
      setNotice(
        code === 'changed'
          ? 'Not saved. This saved record changed or was deleted. Copy these words if needed, then reopen it from Saved on this device.'
          : code === 'full'
            ? 'Not saved. This browser holds 50 app records. Delete an unneeded record or copy this record.'
            : 'Save could not be verified. Storage may be blocked or full. Your record remains here to copy or print. Check Saved on this device before retrying.',
      );
      work.refresh();
    }
  }
  const lesson =
    step === 'task' || step === 'begin' || step === 'result' ? actionLessons[step] : null;
  const title =
    lesson?.question ||
    (step === 'pause'
      ? 'You can pause here.'
      : step === 'review'
        ? 'Review your Action Record.'
        : 'Your result is recorded.');
  const input = (f: ActionField, label = actionLabels[f]) => (
    <TextResponse
      id={'din-' + f}
      label={label}
      value={session[f]}
      limit={2000}
      error={errors[f]}
      onChange={(v) => edit(f, v)}
    />
  );
  const resultChoice = () => (
    <fieldset aria-describedby={errors.result ? 'din-result-error' : undefined}>
      <legend>Your reported result</legend>
      <div class="choices">
        {resultChoices.map((value) => (
          <label class="choice" key={value}>
            <input
              id={'din-' + value}
              type="radio"
              name="action-result"
              checked={session.result === value}
              onChange={() => {
                if (value !== session.result)
                  setSession((old) => ({ ...old, result: value, outcome: '' }));
                setErrors({});
              }}
            />
            <span>{value}</span>
          </label>
        ))}
      </div>
      {errors.result && (
        <p id="din-result-error" class="error" role="alert">
          {errors.result}
        </p>
      )}
    </fieldset>
  );
  const reference = session.reference?.fields;
  const saved = session.savedRaw ? JSON.parse(session.savedRaw) : null;
  const isSaved =
    saved &&
    record &&
    saved.status === session.result &&
    JSON.stringify(saved.record) === JSON.stringify(record);
  return (
    <div class="do-it-now work-width">
      <header class="work-header no-print">
        <div>
          <p class="eyebrow">Do It Now</p>
          <h1 ref={heading} tabIndex={-1}>
            {title}
          </h1>
        </div>
        <p class="work-orientation">
          {step === 'task'
            ? '1 · Name the action'
            : step === 'begin'
              ? '2 · Begin'
              : step === 'result'
                ? '3 · Report the result'
                : step === 'review'
                  ? '4 · Review'
                  : step === 'pause'
                    ? 'No Action Record created'
                    : 'Your report to take with you'}
        </p>
      </header>
      {lesson && (
        <div class="work-layout">
          <aside class="work-lesson" aria-label="A useful distinction">
            <h2>{lesson.title}</h2>
            <p>{lesson.text}</p>
          </aside>
          <form
            class="work-panel"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 'task' && check(['task', 'firstAction'])) go('begin');
              else if (step === 'begin') begin();
              else if (step === 'result' && session.started) {
                if (!session.result) {
                  setErrors({ result: 'Select what happened after you began.' });
                  document.getElementById('din-Completed')?.focus();
                } else if (check(['outcome'])) go('review');
              }
            }}
          >
            {step === 'task' && (
              <>
                {reference && (
                  <p class="storage-notice">
                    Opened from your Execution Card. Your next move is the known task below. Edit it
                    if needed, then name the first real action. Nothing was saved automatically.
                  </p>
                )}
                {input('task', 'What are you doing now?')}
                {input('firstAction', 'What is the smallest real action that begins it?')}
                <p class="field-hint">
                  Small enough to begin now, while still doing a real part of the work.
                </p>
                <button class="button primary" type="submit">
                  Next
                </button>
              </>
            )}
            {step === 'begin' && (
              <>
                <h2>Your beginning</h2>
                <p class="answer">{renderStandardText(session.firstAction)}</p>
                {reference?.start && (
                  <section>
                    <h3>Start condition from Next Move</h3>
                    <p class="answer">{renderStandardText(reference.start)}</p>
                  </section>
                )}
                <fieldset aria-describedby={errors.readiness ? 'din-readiness-error' : undefined}>
                  <legend>Can this action actually begin now?</legend>
                  <div class="choices">
                    <label class="choice">
                      <input
                        id="din-yes"
                        name="action-readiness"
                        type="radio"
                        checked={session.readiness === 'yes'}
                        onChange={() => {
                          setSession((old) => ({ ...old, readiness: 'yes' }));
                          setErrors({});
                        }}
                      />
                      <span>
                        {reference?.start
                          ? 'The start condition is met and I can begin now.'
                          : 'Yes. I can begin now.'}
                      </span>
                    </label>
                    <label class="choice">
                      <input
                        name="action-readiness"
                        type="radio"
                        checked={session.readiness === 'no'}
                        onChange={() => {
                          setSession((old) => ({ ...old, readiness: 'no' }));
                          setErrors({});
                        }}
                      />
                      <span>
                        No. Something still has to be decided, obtained, permitted, made safe, or
                        prepared first.
                      </span>
                    </label>
                  </div>
                </fieldset>
                {errors.readiness && (
                  <p id="din-readiness-error" class="error" role="alert">
                    {errors.readiness}
                  </p>
                )}
                <label class="choice">
                  <input
                    type="checkbox"
                    checked={session.timerMinutes !== ''}
                    onChange={(e) =>
                      setSession((old) => ({
                        ...old,
                        timerMinutes: e.currentTarget.checked ? '5' : '',
                      }))
                    }
                  />
                  <span>Use an optional timer</span>
                </label>
                {session.timerMinutes !== '' && (
                  <div class="work-field">
                    <label for="din-minutes">Minutes (1 to 60)</label>
                    <input
                      id="din-minutes"
                      type="text"
                      inputMode="numeric"
                      value={session.timerMinutes}
                      aria-invalid={!!errors.timer}
                      aria-describedby={`din-timer-hint${errors.timer ? ' din-timer-error' : ''}`}
                      onInput={(e) =>
                        setSession((old) => ({
                          ...old,
                          timerMinutes: e.currentTarget.value || ' ',
                        }))
                      }
                    />
                    <p id="din-timer-hint" class="field-hint">
                      An aid while you work. It does not determine the result.
                    </p>
                    {errors.timer && (
                      <p id="din-timer-error" class="error" role="alert">
                        {errors.timer}
                      </p>
                    )}
                  </div>
                )}
                <p class="small">
                  Begin now records only that you report starting. It does not complete or save an
                  Action Record.
                </p>
                <div class="actions">
                  <button
                    type="button"
                    class="button"
                    onClick={() => {
                      setSession((old) => ({ ...old, step: 'task', readiness: '' }));
                    }}
                  >
                    Back
                  </button>
                  <button type="submit" class="button primary">
                    {session.readiness === 'no' ? 'Pause here' : 'Begin now'}
                  </button>
                </div>
              </>
            )}
            {step === 'result' && (
              <>
                <p class="planned-note">
                  <strong>Begin state: Started</strong>
                </p>
                <p class="answer">{renderStandardText(session.firstAction)}</p>
                <p>
                  You reported beginning. Do the action, then return here when you have a result to
                  record.
                </p>
                {remaining !== null && (
                  <div class="action-timer">
                    <p aria-live="off" aria-label="Time remaining">
                      {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
                    </p>
                    <p role="status">{remaining === 0 ? 'Timer ended. What happened?' : ''}</p>
                    <p class="small">You can report a result before the timer ends.</p>
                  </div>
                )}
                {reference?.completion && (
                  <section>
                    <h3>Completion boundary from Next Move</h3>
                    <p class="answer">{renderStandardText(reference.completion)}</p>
                    <p class="small">Reference only. You choose the result.</p>
                  </section>
                )}
                {resultChoice()}
                {session.result && input('outcome', resultPrompts[session.result])}
                <button type="submit" class="button primary">
                  Review Action Record
                </button>
              </>
            )}
          </form>
        </div>
      )}
      {step === 'pause' && (
        <section class="pause-panel">
          <h2>The action needs to be available before you begin.</h2>
          <p>
            Resolve the decision, information, permission, safety, resources, or preparation first.
            No Started state, timer, or Action Record was created.
          </p>
          <div class="actions">
            <button
              class="button"
              onClick={() => {
                setSession((old) => ({ ...old, step: 'begin', readiness: '' }));
              }}
            >
              Return to begin check
            </button>
            <a href="#/tools/next-move">Open Next Move</a>
            <a href="#/tools/decision-room">Open Decision Room</a>
          </div>
        </section>
      )}
      {step === 'review' && session.started && (
        <form
          class="review-panel"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (check(actionFields) && record) go('record');
          }}
        >
          <h2>Action Record</h2>
          <p>
            Record what you report happened. Edit your wording. Choosing a different result clears
            the evidence so you can describe that result.
          </p>
          {input('task')}
          {input('firstAction')}
          <section class="planned-note">
            <h3>Begin state</h3>
            <p>Started</p>
          </section>
          {resultChoice()}
          {session.result && input('outcome', resultPrompts[session.result])}
          <p>
            <strong>Status: {session.result}</strong> · User-reported result.
          </p>
          <div class="actions">
            <button type="button" class="button" onClick={() => go('result')}>
              Back
            </button>
            <button class="button primary" type="submit">
              Confirm Action Record
            </button>
          </div>
        </form>
      )}
      {step === 'record' && record && session.result && (
        <>
          <RecordView record={record} status={session.result} />
          <section class="artifact-actions no-print" aria-label="Use your Action Record">
            <p class="take-away">
              The result is recorded. Take what happened into the next decision or action if you
              need to.
            </p>
            <div class="actions">
              <button class="button primary" onClick={copy}>
                Copy record
              </button>
              <button class="button" onClick={() => window.print()}>
                Print record
              </button>
              <button class="button" onClick={() => setDialog('save')}>
                {session.savedKey ? 'Save changes on this device' : 'Save on this device'}
              </button>
              <button class="text-button" onClick={() => go('review')}>
                Edit record
              </button>
            </div>
            <p class="small">
              {isSaved
                ? 'This wording and result are saved in this browser profile.'
                : session.savedKey
                  ? 'Changes are in memory. Saving requires your choice.'
                  : 'In memory only. Nothing is saved unless you choose to save.'}
            </p>
            <p class="small">Clipboard sync, printouts, and PDFs are outside local deletion.</p>
            {fallback && (
              <div class="copy-fallback">
                <label for="din-copy">Action Record plain text</label>
                <textarea
                  id="din-copy"
                  ref={copyArea}
                  readOnly
                  value={actionText(record, session.result)}
                  rows={12}
                />
                <button
                  class="button"
                  onClick={() => {
                    copyArea.current?.focus();
                    copyArea.current?.select();
                  }}
                >
                  Select all text
                </button>
              </div>
            )}
          </section>
        </>
      )}
      <p class="work-status no-print" role="status">
        {notice}
      </p>
      <footer class="work-footer no-print">
        <div>
          <SourceNote items={['execution']} />
          <p class="small">
            Work and any timer stay in memory during navigation here. Reloading or closing the tab
            can discard unsaved work. You can stop at any time.
          </p>
        </div>
        <button class="text-button" onClick={() => setDialog('clear')}>
          Clear current work
        </button>
      </footer>
      {dialog === 'save' && (
        <ConfirmDialog
          title="Save on this device?"
          confirm={session.savedKey ? 'Save these changes' : 'Save this record'}
          onCancel={() => setDialog(null)}
          onConfirm={save}
        >
          <LocalNotice artifact="Action Record" />
        </ConfirmDialog>
      )}
      {dialog === 'clear' && (
        <ConfirmDialog
          title="Clear current work?"
          confirm="Clear current work"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setSession(newActionSession());
            setDialog(null);
          }}
        >
          <p>
            This clears the current Do It Now session and timer. Saved Action Records stay until you
            delete them.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
