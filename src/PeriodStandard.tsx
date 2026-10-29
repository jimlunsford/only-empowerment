import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { Dispatch, StateUpdater } from 'preact/hooks';
import { TextResponse, ConfirmDialog } from './components/work';
import { renderStandardText } from './components/artifact-text';
import {
  periodExercise as copy,
  periodValues,
  periodBook,
  contentVersion,
  type PeriodValueId,
} from './period-content';
import {
  characterCount,
  hasPeriodDraft,
  newPeriodSession,
  periodErrors,
  periodCardText,
  periodFields,
  periodLabels,
  periodLimits,
  type PeriodSession,
  type PeriodDraft,
  type PeriodField,
} from './period-standard-model';
export function PeriodCard({ draft, example = false }: { draft: PeriodDraft; example?: boolean }) {
  return (
    <article
      class="period-card"
      aria-labelledby={example ? 'period-example-title' : 'period-card-title'}
    >
      <div class="card-top">
        <p>The PERIOD Code · Only Empowerment</p>
        {example ? (
          <h2 id="period-example-title">Example standard card</h2>
        ) : (
          <h1 id="period-card-title" tabIndex={-1}>
            Your standard card
          </h1>
        )}
        {example && <p>An illustration, not your personal commitment.</p>}
        <p class="card-status">
          <span class="sr-only">Status: </span>Chosen, not yet demonstrated
        </p>
      </div>
      <section class="card-value">
        {example ? <h3>Value</h3> : <h2>Value</h2>}
        <p>{periodValues.find((v) => v.id === draft.valueId)?.name}</p>
      </section>
      {periodFields
        .filter((f) => f !== 'returnPlan' || draft[f].trim())
        .map((f) => (
          <section class={f === 'standard' ? 'card-standard' : 'card-field'} key={f}>
            {example ? <h3>{periodLabels[f]}</h3> : <h2>{periodLabels[f]}</h2>}
            <p class="answer" data-field={f}>
              {renderStandardText(draft[f])}
            </p>
          </section>
        ))}
      <p class="card-note">{copy.footnote}</p>
      <p class="card-source">
        {copy.source}
        <br />
        {periodBook.url}
      </p>
    </article>
  );
}
export function PeriodStandard({
  session,
  setSession,
}: {
  session: PeriodSession;
  setSession: Dispatch<StateUpdater<PeriodSession>>;
}) {
  const { draft, view, notice } = session;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [supportOpen, setSupportOpen] = useState(!!draft.returnPlan);
  const example = useRef<HTMLDetailsElement>(null);
  const fallbackArea = useRef<HTMLTextAreaElement>(null);
  // Route focus belongs to the shell. These focus requests occur only after a local action.
  const [focusTarget, setFocusTarget] = useState<{ id: string; sequence: number } | null>(null);
  const focus = (id: string) =>
    setFocusTarget((old) => ({ id, sequence: (old?.sequence || 0) + 1 }));
  useLayoutEffect(() => {
    if (focusTarget) document.getElementById(focusTarget.id)?.focus();
  }, [focusTarget]);
  useLayoutEffect(() => {
    if (fallback) {
      fallbackArea.current?.focus();
      fallbackArea.current?.select();
    }
  }, [fallback]);
  function edit(f: PeriodField, value: string) {
    setSession((old) => ({ ...old, draft: { ...old.draft, [f]: value } }));
    setErrors((old) => ({ ...old, [f]: '' }));
  }
  function showEditor() {
    setSession((old) => ({ ...old, view: 'edit' }));
    setFallback(false);
    setStatus('');
    focus('period-valueId');
  }
  async function copyCard() {
    const text = periodCardText(draft);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Card copied.');
      setFallback(false);
    } catch {
      setStatus('Copy was blocked. Select and copy the text below.');
      setFallback(true);
    }
  }
  function makeCard(e: SubmitEvent) {
    e.preventDefault();
    const next = periodErrors(draft);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      if (first === 'returnPlan') setSupportOpen(true);
      focus(`period-${first}`);
      return;
    }
    setSession((old) => ({ ...old, view: 'card', notice: '' }));
    setStatus('');
    setFallback(false);
    focus('period-card-title');
  }
  const selected = periodValues.find((v) => v.id === draft.valueId);
  const recoveryAndClear = (
    <>
      <p class="copy-status no-print" role="status">
        {status}
      </p>
      {fallback && (
        <div class="copy-fallback no-print">
          <label for="period-copy">Card text to copy</label>
          <textarea
            id="period-copy"
            ref={fallbackArea}
            readOnly
            value={periodCardText(draft)}
            rows={12}
          />
          <button
            class="button"
            onClick={() => {
              fallbackArea.current?.focus();
              fallbackArea.current?.select();
            }}
          >
            Select all text
          </button>
        </div>
      )}
      <div class="actions draft-actions no-print">
        <a href="#/period/values/ownership">Return to the values</a>
        <button
          id="period-clear"
          class="button"
          onClick={() => {
            if (hasPeriodDraft(draft)) setClearing(true);
            else {
              setSession(newPeriodSession());
              setStatus('Draft cleared.');
            }
          }}
        >
          Clear this draft
        </button>
      </div>
      <p class="small export-note no-print">{copy.exportNote}</p>
      {clearing && (
        <ConfirmDialog
          title="Clear this draft?"
          cancel="Keep writing"
          confirm="Clear draft"
          onCancel={() => setClearing(false)}
          onConfirm={() => {
            setSession(newPeriodSession());
            setErrors({});
            setStatus('Draft cleared.');
            setFallback(false);
            setSupportOpen(false);
            setClearing(false);
            focus('period-clear');
          }}
        >
          <p>This removes the words in this tab. Copies and printouts are not affected.</p>
        </ConfirmDialog>
      )}
    </>
  );
  return (
    <div class={`period-standard ${view === 'card' ? 'period-result' : 'editor'}`}>
      {notice && (
        <p class="global-notice no-print" role="status">
          {notice}{' '}
          {notice === 'You already have a standard in progress.' && (
            <button class="button" onClick={showEditor}>
              Change the value
            </button>
          )}
        </p>
      )}

      {view === 'edit' ? (
        <>
          <div class="editor-heading">
            <h1 tabIndex={-1}>
              Turn a Value <br />
              into a <em>Standard.</em>
            </h1>
            <p class="lead">{copy.lead}</p>
          </div>
          <p class="mobile-privacy">{copy.privacy}</p>
          <div class="period-editor-layout editor-layout">
            <form class="period-form" onSubmit={makeCard} noValidate autoComplete="off">
              <div class="work-field">
                <label for="period-valueId">{copy.questions[0]}</label>
                <p class="field-hint" id="period-value-hint">
                  {copy.hints[0]}
                </p>
                <select
                  id="period-valueId"
                  value={draft.valueId}
                  aria-required="true"
                  aria-invalid={!!errors.valueId}
                  aria-describedby={`period-value-hint${errors.valueId ? ' period-value-error' : ''}`}
                  onChange={(e) => {
                    const valueId = e.currentTarget.value as PeriodValueId | '';
                    setSession((old) => ({
                      ...old,
                      draft: { ...old.draft, valueId },
                      notice:
                        old.draft.valueId ||
                        old.draft.standard ||
                        old.draft.nextApplication ||
                        old.draft.returnPlan
                          ? 'Your wording is unchanged. Check that it still fits this value.'
                          : '',
                    }));
                    setErrors((old) => ({ ...old, valueId: '' }));
                  }}
                >
                  <option value="">Choose a value</option>
                  {periodValues.map((v) => (
                    <option value={v.id} key={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                {errors.valueId && (
                  <p class="error" id="period-value-error" role="alert">
                    {errors.valueId}
                  </p>
                )}
                {selected && (
                  <p>
                    {selected.role}{' '}
                    {selected.id === 'ownership' ? (
                      <a href="#/period/values/ownership">Read about Ownership</a>
                    ) : (
                      <span class="small">
                        The {selected.name} lesson is not included in this candidate.
                      </span>
                    )}
                  </p>
                )}
              </div>
              <details class="mobile-teaching">
                <summary>What makes a useful standard?</summary>
                <p>{copy.teaching}</p>
                <p>{copy.guardrail}</p>
              </details>
              {(['standard', 'nextApplication'] as const).map((f, i) => (
                <TextResponse
                  key={f}
                  id={`period-${f}`}
                  label={copy.questions[i + 1]}
                  hint={copy.hints[i + 1]}
                  value={draft[f]}
                  limit={periodLimits[f]}
                  count={characterCount}
                  rows={3}
                  error={errors[f]}
                  onChange={(value) => edit(f, value)}
                />
              ))}
              <details
                class="support"
                open={supportOpen}
                onToggle={(e) => setSupportOpen(e.currentTarget.open)}
              >
                <summary>
                  {draft.returnPlan
                    ? 'Edit your support or correction'
                    : 'Add a way to return when it gets difficult'}
                </summary>
                <TextResponse
                  id="period-returnPlan"
                  label={copy.questions[3]}
                  hint={copy.hints[3]}
                  value={draft.returnPlan}
                  limit={300}
                  count={characterCount}
                  rows={3}
                  required={false}
                  error={errors.returnPlan}
                  onChange={(value) => edit('returnPlan', value)}
                />
              </details>
              <p class="selfcheck">{copy.selfCheck}</p>
              <button class="button primary" type="submit">
                Make my standard card
              </button>
            </form>
            <aside class="editor-guide">
              <div class="teaching">
                <h2>
                  From an idea
                  <br />
                  to a behavior.
                </h2>
                <p>{copy.teaching}</p>
                <p>{copy.guardrail}</p>
              </div>
              <details ref={example} class="period-example">
                <summary>See a finished example</summary>
                <PeriodCard example draft={{ ...copy.example, contentVersion }} />
                <p>{copy.exampleLesson}</p>
                <button
                  class="button"
                  onClick={() => {
                    if (example.current) example.current.open = false;
                    focus('period-valueId');
                  }}
                >
                  Write my own standard
                </button>
              </details>

              <p class="privacy">{copy.privacy}</p>
            </aside>
          </div>
          <div class="editor-bottom">{recoveryAndClear}</div>
        </>
      ) : (
        <div class="result-grid">
          <PeriodCard draft={draft} />
          <aside class="result-actions no-print">
            <h2>
              Keep the standard.
              <br />
              Practice the behavior.
            </h2>
            <p>
              Copy or print anything you want to keep. Reloading or closing this tab can discard
              your words.
            </p>
            <div class="actions">
              <button class="button primary" onClick={copyCard}>
                Copy my card
              </button>
              <button class="button" onClick={() => window.print()}>
                Print my card
              </button>
              <button class="text-button" onClick={showEditor}>
                Edit my card
              </button>
            </div>
            {recoveryAndClear}
          </aside>
        </div>
      )}
    </div>
  );
}
