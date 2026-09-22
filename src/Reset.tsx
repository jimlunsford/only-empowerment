import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { TextResponse, ConfirmDialog, LocalNotice } from './components/work';
import { SourceNote } from './components/shared';
import { renderStandardText } from './components/artifact-text';
import {
  resetFields,
  resetLabels,
  resetSteps,
  resetErrors,
  resetText,
  validReset,
  newResetSession,
  standardConfirmed,
  RESET_LIMIT,
  type ResetPlan,
  type ResetField,
  type ResetStep,
  type StandardSource,
  type StandardStanding,
} from './reset-model';
import { resetLessons } from './reset-lessons';
import { standardLabels } from './standard-model';
import { browserStorage, CardStorageError } from './local-cards';
import { parseStandard, type StandardEntry } from './local-standards';
import { saveReset } from './local-resets';
import { broadcast, type LocalWork } from './use-local-work';

export function ResetArtifact({
  plan,
  review = false,
  editor,
}: {
  plan: ResetPlan;
  review?: boolean;
  editor?: (field: ResetField) => ComponentChildren;
}) {
  return (
    <article
      class="output-card execution-card personal-standard reset-plan"
      aria-labelledby="reset-title"
    >
      <div class="artifact-header">
        <p class="eyebrow">Only Empowerment · Reset</p>
        {!review && <span class="planned-badge">Status: Planned</span>}
      </div>
      <h2 id="reset-title" tabIndex={-1}>
        Reset Plan{review ? ' review' : ''}
      </h2>
      {resetFields.map((f) => (
        <section class={`artifact-section reset-${f}`} key={f}>
          <h3>{resetLabels[f]}</h3>
          <p class="answer">{renderStandardText(plan[f])}</p>
          {editor?.(f)}
        </section>
      ))}
      {!review && (
        <>
          <p class="artifact-footnote">
            Planned means a correction and return plan exists. It does not mean the correction
            happened or proof was created.
          </p>
          <p class="print-only">
            Built by Jim Lunsford · jimlunsford.com
            <br />
            Based on The PERIOD Code, How to Rebuild Yourself, and The Discipline Loop ·
            jimlunsford.com/core-frameworks/
          </p>
        </>
      )}
    </article>
  );
}
export function Reset({ work }: { work: LocalWork }) {
  const { resetSession: session, setResetSession: setSession } = work;
  const { plan, step } = session;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<ResetField | null>(null);
  const [dialog, setDialog] = useState<'save' | 'clear' | null>(null);
  const [fallback, setFallback] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null),
    copyArea = useRef<HTMLTextAreaElement>(null);
  const standards = work.entries.filter(
    (e): e is StandardEntry => e.record.tool === 'build-a-standard',
  );
  useLayoutEffect(() => {
    heading.current?.focus();
    setErrors({});
    setStatus('');
    setFallback(false);
    setEditing(null);
  }, [step]);
  useEffect(() => {
    work.refresh();
  }, []);
  useEffect(() => {
    if (fallback) {
      copyArea.current?.focus();
      copyArea.current?.select();
    }
  }, [fallback]);
  useEffect(() => {
    if (step === 'slip' && !plan.slip) {
      setDialog(null);
      setFallback(false);
      setStatus('');
      setEditing(null);
    }
  }, [plan, step]);
  function go(next: ResetStep) {
    setSession((old) => ({ ...old, step: next }));
  }
  function edit(f: ResetField, value: string) {
    setSession((old) => ({
      ...old,
      plan: { ...old.plan, [f]: value },
      ...(f === 'standard' && value !== old.plan.standard
        ? { standing: '', checkedStandard: null }
        : {}),
    }));
    setErrors((old) => ({ ...old, [f]: '' }));
  }
  function validate(fields = resetFields) {
    const next = resetErrors(plan, fields);
    setErrors(next);
    const first = Object.keys(next)[0] as ResetField | undefined;
    if (first) {
      if (step === 'review') setEditing(first);
      requestAnimationFrame(() => document.getElementById('reset-' + first)?.focus());
    }
    return !first;
  }
  function chooseSource(source: StandardSource) {
    setSession((old) => ({
      ...old,
      source,
      standing: '',
      checkedStandard: null,
      reference: null,
      selectedKey: null,
      plan: { ...old.plan, standard: '' },
    }));
    setErrors({});
  }
  function selectStandard(key: string) {
    try {
      const raw = browserStorage().getItem(key),
        record = parseStandard(raw, key);
      if (!record) throw new Error('unavailable');
      setSession((old) => ({
        ...old,
        selectedKey: key,
        reference: structuredClone(record.standard),
        plan: { ...old.plan, standard: record.standard.standard },
        standing: '',
        checkedStandard: null,
      }));
      setErrors({});
      setStatus('Reference selected. Your other Reset answers are unchanged.');
    } catch {
      work.refresh();
      setStatus(
        'That saved standard could not be read. Choose an available standard or state the line yourself.',
      );
    }
  }
  function standing(value: StandardStanding) {
    setSession((old) => ({
      ...old,
      standing: value,
      checkedStandard: value === 'stands' ? old.plan.standard : null,
    }));
    setErrors((old) => ({ ...old, standing: '' }));
  }
  function recheck() {
    setSession((old) => ({ ...old, step: 'standard', returnToReview: true }));
  }
  const field = (f: ResetField, label?: string) => (
    <TextResponse
      id={`reset-${f}`}
      label={label || resetLabels[f]}
      value={plan[f]}
      limit={RESET_LIMIT}
      error={errors[f]}
      onChange={(v) => edit(f, v)}
    />
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(resetText(plan));
      setStatus('Reset Plan copied.');
      setFallback(false);
    } catch {
      setStatus('Copy was blocked. Select and copy the plain text below.');
      setFallback(true);
    }
  }
  function save() {
    setDialog(null);
    try {
      if (!standardConfirmed(session) || (session.savedKey && !session.savedRaw))
        throw new CardStorageError('changed');
      const entry = saveReset(
        browserStorage(),
        plan,
        session.savedKey && session.savedRaw
          ? { key: session.savedKey, raw: session.savedRaw }
          : undefined,
      );
      setSession((old) => ({ ...old, savedKey: entry.key, savedRaw: entry.raw }));
      work.refresh();
      broadcast({ type: 'refresh' });
      setStatus('Saved on this device.');
    } catch (e) {
      const code = e instanceof CardStorageError ? e.message : '';
      setStatus(
        code === 'changed'
          ? 'Not saved. This record changed or was deleted, or its standard needs review. Copy your words before reopening it from Saved work.'
          : code === 'full'
            ? 'Not saved. Up to 50 saved Only Empowerment records total. Delete an unneeded record or copy this Reset Plan.'
            : 'Save could not be verified. Browser storage may be blocked or full. Your plan remains here to copy or print. Check Saved work before retrying.',
      );
      work.refresh();
    }
  }
  const lesson =
    step === 'review' || step === 'record' || step === 'pause' ? null : resetLessons[step];
  const isSaved =
    session.savedRaw && JSON.stringify(JSON.parse(session.savedRaw).plan) === JSON.stringify(plan);
  return (
    <div class="reset work-width">
      <header class="work-header no-print">
        <div>
          <p class="eyebrow">Reset</p>
          <h1 ref={heading} tabIndex={-1}>
            {lesson?.heading ||
              (step === 'pause'
                ? 'Review the standard first.'
                : step === 'review'
                  ? 'Review your return to the standard.'
                  : 'The reset is planned. Now create the proof.')}
          </h1>
        </div>
        <p class="work-orientation">
          {lesson
            ? `Step ${resetSteps.indexOf(step as ResetField) + 1} of 7`
            : step === 'record'
              ? 'A plan to take into action'
              : 'Your words. Your choice.'}
        </p>
      </header>
      {step === 'slip' && (
        <div class="decision-entry">
          <p>
            Name the miss, return to the standard, and define the correction, structure, and next
            proof. The plan is not the reset. The next action creates the proof.
          </p>
          <p class="small">
            Urgent safety or professional needs take priority over completing this tool.
          </p>
        </div>
      )}
      {lesson && (
        <div class="work-layout">
          <aside class="work-lesson" aria-label="A useful distinction">
            <h2>{lesson.title}</h2>
            <p>{lesson.text}</p>
            {'example' in lesson && (
              <details class="lesson-example">
                <summary>Behavior, not identity</summary>
                <p>{lesson.example}</p>
              </details>
            )}
            {step !== 'slip' && step !== 'standard' && (
              <details class="comparison-context">
                <summary>Your standard and weak point</summary>
                <h3>Standard</h3>
                <p class="answer">{renderStandardText(plan.standard)}</p>
                {plan.weakPoint && (
                  <>
                    <h3>Weak point</h3>
                    <p class="answer">{renderStandardText(plan.weakPoint)}</p>
                  </>
                )}
                <button class="text-button" onClick={() => go('standard')}>
                  Revisit the standard
                </button>
              </details>
            )}
          </aside>
          <form
            class="work-panel"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 'standard') {
                if (session.source === 'unclear') {
                  go('pause');
                  return;
                }
                if (!session.source) {
                  setErrors({ source: 'Choose how to name your standard.' });
                  document.getElementById('source-manual')?.focus();
                  return;
                }
                if (session.source === 'saved' && !session.reference) {
                  setErrors({
                    source:
                      'Select a saved Personal Standard explicitly, or state the standard yourself.',
                  });
                  document.getElementById('saved-standard')?.focus();
                  return;
                }
                if (!validate(['standard'])) return;
                if (!session.standing) {
                  setErrors({ standing: 'Choose whether this standard still fits.' });
                  document.getElementById('standing-stands')?.focus();
                  return;
                }
                if (session.standing !== 'stands') {
                  go('pause');
                  return;
                }
                if (!standardConfirmed(session)) return;
                setSession((old) => ({
                  ...old,
                  step: old.returnToReview ? 'review' : 'ownership',
                  returnToReview: false,
                }));
                return;
              }
              if (validate([step as ResetField]))
                go(
                  step === 'proof'
                    ? 'review'
                    : resetSteps[resetSteps.indexOf(step as ResetField) + 1],
                );
            }}
          >
            {step === 'standard' ? (
              <>
                <fieldset
                  class="reset-choices"
                  aria-describedby={errors.source ? 'source-error' : undefined}
                >
                  <legend>What standard are you returning to?</legend>
                  {(
                    [
                      ['manual', 'State the standard myself'],
                      ['saved', 'Use a saved Personal Standard'],
                      ['unclear', 'I do not have a clear standard yet'],
                    ] as const
                  ).map(([value, label]) => (
                    <label class="reset-choice" key={value}>
                      <input
                        id={`source-${value}`}
                        type="radio"
                        name="standard-source"
                        checked={session.source === value}
                        onChange={() => chooseSource(value)}
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
                {errors.source && (
                  <p id="source-error" class="error" role="alert">
                    {errors.source}
                  </p>
                )}
                {session.source === 'saved' && (
                  <div class="standard-selection">
                    <label for="saved-standard">Choose a saved Personal Standard</label>
                    <select
                      id="saved-standard"
                      value={session.selectedKey || ''}
                      onChange={(e) => {
                        if (e.currentTarget.value) selectStandard(e.currentTarget.value);
                      }}
                    >
                      <option value="" disabled>
                        Select a standard
                      </option>
                      {standards.map((entry, i) => (
                        <option key={entry.key} value={entry.key}>
                          {i + 1}. {entry.record.standard.area.slice(0, 70)} ·{' '}
                          {entry.record.standard.standard.slice(0, 90)}
                        </option>
                      ))}
                    </select>
                    {standards.length === 0 && (
                      <p>
                        No saved Personal Standards are available. State your standard here, or
                        pause to build one.
                      </p>
                    )}
                    {work.storageError && <p role="status">{work.storageError}</p>}
                    {session.reference && session.selectedKey && (
                      <button
                        class="button"
                        type="button"
                        onClick={() => selectStandard(session.selectedKey!)}
                      >
                        Reload selected standard
                      </button>
                    )}
                    {session.reference && (
                      <details
                        class="reset-reference"
                        aria-label="Selected Personal Standard reference"
                      >
                        <summary>View selected standard reference</summary>
                        <p class="small">
                          Read-only snapshot. Reset will not change this Personal Standard. Only its
                          standard statement goes into your separate Reset Plan.
                        </p>
                        {(
                          [
                            'area',
                            'standard',
                            'keeping',
                            'violations',
                            'structure',
                            'correction',
                          ] as const
                        ).map((f) => (
                          <div key={f}>
                            <h3>{standardLabels[f]}</h3>
                            {Array.isArray(session.reference![f]) ? (
                              <ul>
                                {(session.reference![f] as string[]).map((v, i) => (
                                  <li class="answer" key={i}>
                                    {renderStandardText(v)}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p class="answer">
                                {renderStandardText(session.reference![f] as string)}
                              </p>
                            )}
                          </div>
                        ))}
                      </details>
                    )}
                  </div>
                )}
                {(session.source === 'manual' ||
                  (session.source === 'saved' && session.reference)) && (
                  <>
                    {field(
                      'standard',
                      session.source === 'saved'
                        ? 'Standard statement for this Reset Plan'
                        : lesson.question,
                    )}
                    <p class="small">
                      If the line itself needs changing, review it in Build a Standard. Editing this
                      snapshot never changes a saved Personal Standard.
                    </p>
                    <fieldset
                      class="reset-choices"
                      aria-describedby={errors.standing ? 'standing-error' : undefined}
                    >
                      <legend>
                        Does this standard still fit the reality you are dealing with?
                      </legend>
                      {(
                        [
                          ['stands', 'The standard still stands.'],
                          ['review', 'The standard needs deliberate review.'],
                          ['unsure', 'I am not sure whether the standard still fits.'],
                        ] as const
                      ).map(([value, label]) => (
                        <label class="reset-choice" key={value}>
                          <input
                            id={`standing-${value}`}
                            type="radio"
                            name="standard-standing"
                            checked={session.standing === value}
                            onChange={() => standing(value)}
                          />
                          {label}
                        </label>
                      ))}
                    </fieldset>
                    {errors.standing && (
                      <p id="standing-error" class="error" role="alert">
                        {errors.standing}
                      </p>
                    )}
                  </>
                )}
              </>
            ) : (
              field(step as ResetField, lesson.question)
            )}
            <div class="actions workflow-actions">
              {step !== 'slip' && (
                <button
                  type="button"
                  class="button"
                  onClick={() => go(resetSteps[resetSteps.indexOf(step as ResetField) - 1])}
                >
                  Back
                </button>
              )}
              <button type="submit" class="button primary">
                {step === 'proof' ? 'Review my Reset Plan' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      )}
      {step === 'pause' && (
        <section class="pause-panel">
          <h2>
            {session.source === 'unclear'
              ? 'Define the line before planning a return.'
              : 'Give the line deliberate review.'}
          </h2>
          <p>
            {session.source === 'unclear'
              ? 'A reset needs a clear standard. Build a Standard can help you choose that line. No Reset Plan has been created.'
              : 'Do not use the pressure of the miss to quietly rewrite the line. Review the standard deliberately before building the reset. No new Reset Plan has been confirmed.'}
          </p>
          <p>
            Your Reset work stays in memory during navigation in this tab. Reloading or closing the
            tab can discard unsaved work. When you return, state the reviewed standard or explicitly
            select a saved one again.
          </p>
          <div class="actions">
            <a class="button primary" href="#/tools/build-a-standard">
              Open Build a Standard
            </a>
            <button class="button" onClick={() => go('standard')}>
              Return to the standard check
            </button>
          </div>
        </section>
      )}
      {step === 'review' && (
        <>
          <p class="review-intro">
            Read the plan as something you will act on. Does it address the miss, repair the weak
            point, and name observable proof at a real opportunity? Keep the wording yours.
          </p>
          <ResetArtifact
            plan={plan}
            review
            editor={(f) => (
              <div class="standard-review-edit no-print">
                {editing === f ? (
                  <>
                    {field(f)}
                    <button
                      class="button"
                      onClick={() => {
                        if (validate([f])) {
                          setEditing(null);
                          if (f === 'standard' && !standardConfirmed(session)) recheck();
                          else
                            requestAnimationFrame(() =>
                              document.getElementById(`edit-reset-${f}`)?.focus(),
                            );
                        }
                      }}
                    >
                      Done editing {resetLabels[f].toLowerCase()}
                    </button>
                  </>
                ) : (
                  <button
                    id={`edit-reset-${f}`}
                    class="text-button"
                    onClick={() => {
                      setEditing(f);
                      requestAnimationFrame(() => document.getElementById(`reset-${f}`)?.focus());
                    }}
                  >
                    Edit {resetLabels[f].toLowerCase()}
                  </button>
                )}
              </div>
            )}
          />
          {!standardConfirmed(session) && (
            <p class="storage-notice">
              The standard statement changed. Confirm whether it still stands before setting this
              plan.
            </p>
          )}
          <div class="planned-note">
            <strong>Status after confirmation: Planned</strong>
            <p>
              This confirms the plan only. It does not mean the correction happened, the standard
              was restored through action, or proof was created.
            </p>
          </div>
          <div class="actions">
            <button class="button" onClick={() => go('proof')}>
              Back
            </button>
            <button
              class="button primary"
              onClick={() => {
                if (!standardConfirmed(session)) {
                  recheck();
                  return;
                }
                if (validate() && validReset(plan)) go('record');
              }}
            >
              {standardConfirmed(session) ? 'Confirm Reset Plan' : 'Check the standard again'}
            </button>
          </div>
        </>
      )}
      {step === 'record' && (
        <>
          <ResetArtifact plan={plan} />
          <section class="artifact-actions no-print" aria-label="Use your Reset Plan">
            <p class="take-away">The plan is yours. Leave here and take the next action.</p>
            <div class="actions">
              <button class="button primary" onClick={copy}>
                Copy plan
              </button>
              <button class="button" onClick={() => window.print()}>
                Print plan
              </button>
              <button class="button" onClick={() => setDialog('save')}>
                {session.savedKey ? 'Save changes on this device' : 'Save on this device'}
              </button>
              <button class="text-button" onClick={() => go('review')}>
                Edit plan
              </button>
            </div>
            <p class="small">
              {isSaved
                ? 'This wording is saved in this browser profile.'
                : 'In memory only unless you explicitly save. Changes do not update a saved record automatically.'}
            </p>
            <p class="small">Clipboard sync, printouts, and PDFs are outside local deletion.</p>
            {fallback && (
              <div class="copy-fallback">
                <label for="reset-copy">Reset Plan plain text</label>
                <textarea
                  id="reset-copy"
                  ref={copyArea}
                  readOnly
                  value={resetText(plan)}
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
        {status}
      </p>
      <footer class="work-footer no-print">
        <div>
          <SourceNote items={['period', 'rebuild', 'loop']} />
          <p class="small">
            Work stays in memory during navigation within this site. Reloading or closing this tab
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
          confirm={session.savedKey ? 'Save these changes' : 'Save this plan'}
          onCancel={() => setDialog(null)}
          onConfirm={save}
        >
          <LocalNotice artifact="Reset Plan" />
        </ConfirmDialog>
      )}
      {dialog === 'clear' && (
        <ConfirmDialog
          title="Clear current work?"
          confirm="Clear current work"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setSession(newResetSession());
            setDialog(null);
          }}
        >
          <p>
            This clears the current Reset session. Saved records and work in other tools stay until
            you delete them.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
