import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { TextResponse, ConfirmDialog, LocalNotice } from './components/work';
import { SourceNote } from './components/shared';
import {
  decisionFields,
  decisionLabels,
  decisionLimits,
  decisionReadiness,
  decisionSteps,
  decisionText,
  lenses,
  newDecisionSession,
  newOption,
  prepareHandoff,
  reversibilities,
  textError,
  validDecision,
  type Decision,
  type DecisionField,
  type DecisionHandoff,
  type DecisionStep,
  type Option,
} from './decision-room-model';
import { decisionLessons } from './decision-room-lessons';
import { newSession } from './next-move-model';
import { browserStorage, CardStorageError } from './local-cards';
import { saveDecision } from './local-decisions';
import { broadcast, type LocalWork } from './use-local-work';

export function DecisionRecord({ decision: d }: { decision: Decision }) {
  const section = (label: string, text: string) => (
    <section class="artifact-section">
      <h3>{label}</h3>
      <p class="answer">{text}</p>
    </section>
  );
  return (
    <article
      class="output-card execution-card decision-record"
      aria-labelledby="decision-record-title"
    >
      <div class="artifact-header">
        <p class="eyebrow">Only Empowerment · Decision Room</p>
        <span class="planned-badge">Status: Decided</span>
      </div>
      <h2 id="decision-record-title" tabIndex={-1}>
        Decision Record
      </h2>
      {section('Decision', d.decision)}
      <section class="artifact-section">
        <h3>Options considered</h3>
        <ol>
          {d.options.map((o) => (
            <li key={o.id} class="answer">
              {o.label}
            </li>
          ))}
        </ol>
      </section>
      {(['matters', ...lenses] as DecisionField[]).map((f) => section(decisionLabels[f], d[f]))}
      <section class="artifact-section">
        <h3>Practical tradeoffs</h3>
        {d.options.map((o) => (
          <section key={o.id} class="option-tradeoff">
            <h4 class="answer">{o.label}</h4>
            <p class="answer">{o.tradeoff}</p>
            <p>Reversibility: {o.reversibility}</p>
          </section>
        ))}
      </section>
      {section('Uncertainty', d.uncertainty)}
      {section('Chosen option', d.options.find((o) => o.id === d.chosenId)?.label || '')}
      {section('Why I chose it', d.rationale)}
      {section('First move', d.firstMove)}
      <p class="artifact-footnote">
        Decided records your choice. It does not mean the decision is correct or that you have acted
        on it.
      </p>
      <p class="print-only">
        Based on The PERIOD Code · jimlunsford.com/period-code/
        <br />
        Built by Jim Lunsford · jimlunsford.com
      </p>
    </article>
  );
}
export function DecisionRoom({ work }: { work: LocalWork }) {
  const { decisionSession: session, setDecisionSession: setSession } = work;
  const { decision: d, step } = session;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [dialog, setDialog] = useState<'clear' | 'save' | 'replace' | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);
  const [handoff, setHandoff] = useState<DecisionHandoff | null>(null);
  const heading = useRef<HTMLHeadingElement>(null),
    copyArea = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    heading.current?.focus();
    setErrors({});
    setStatus('');
    setFallback(false);
  }, [step]);
  useEffect(() => {
    if (fallback) {
      copyArea.current?.focus();
      copyArea.current?.select();
    }
  }, [fallback]);
  useEffect(() => {
    if (step === 'define' && !d.decision) {
      setFallback(false);
      setDialog(null);
      setRemoving(null);
      setHandoff(null);
      setStatus('');
    }
  }, [d, step]);
  useEffect(() => {
    if (session.step === 'handoff') go('record');
  }, []);
  function go(next: DecisionStep) {
    setSession((old) => ({ ...old, step: next }));
  }
  function edit(field: DecisionField, value: string) {
    setSession((old) => ({ ...old, decision: { ...old.decision, [field]: value } }));
    setErrors((old) => ({ ...old, [field]: '' }));
  }
  function optionEdit(id: string, field: keyof Option, value: string) {
    setSession((old) => ({
      ...old,
      decision: {
        ...old.decision,
        options: old.decision.options.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
      },
    }));
    setErrors((old) => ({ ...old, [`${field}-${id}`]: '' }));
  }
  function report(next: Record<string, string>) {
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) document.getElementById(`dr-${first}`)?.focus();
    return !first;
  }
  function validate(all = false) {
    const next: Record<string, string> = {};
    const fs: readonly DecisionField[] = all
      ? decisionFields
      : step === 'define'
        ? ['decision']
        : step === 'reason'
          ? ['rationale', 'firstMove']
          : decisionFields.includes(step as DecisionField)
            ? [step as DecisionField]
            : [];
    fs.forEach((f) => {
      const e = textError(d[f], decisionLimits[f], decisionLabels[f]);
      if (e) next[f] = e;
    });
    if (all || step === 'options') {
      d.options.forEach((o) => {
        const e = textError(o.label, 300, 'option');
        if (e) next[`label-${o.id}`] = e;
      });
    }
    if (all || step === 'practical')
      d.options.forEach((o) => {
        const e = textError(o.tradeoff, 2000, 'tradeoffs');
        if (e) next[`tradeoff-${o.id}`] = e;
        if (!reversibilities.includes(o.reversibility as (typeof reversibilities)[number]))
          next[`reversibility-${o.id}`] =
            'Choose a reversibility description, including not yet known.';
      });
    if ((all || step === 'choice') && !d.options.some((o) => o.id === d.chosenId))
      next.choice = 'Select your option. Nothing has been chosen for you.';
    if ((all || step === 'readiness') && !session.readiness)
      next.readiness = 'Choose what fits, including not being ready.';
    return report(next);
  }
  function advance() {
    if (!validate()) return;
    if (step === 'readiness') {
      go(session.readiness === 'ready' ? 'choice' : 'pause');
      return;
    }
    if (step === 'reason') go('review');
    else go(decisionSteps[decisionSteps.indexOf(step) + 1]);
  }
  function removeOption(id: string) {
    setSession((old) => ({
      ...old,
      decision: {
        ...old.decision,
        options: old.decision.options.filter((o) => o.id !== id),
        chosenId: old.decision.chosenId === id ? '' : old.decision.chosenId,
      },
    }));
    setRemoving(null);
    setStatus('Option removed. Check any reflections that referred to it.');
    requestAnimationFrame(() => document.getElementById('add-option')?.focus());
  }
  const field = (f: DecisionField, question?: string) => (
    <TextResponse
      key={f}
      id={`dr-${f}`}
      label={question || decisionLabels[f]}
      value={d[f]}
      limit={decisionLimits[f]}
      onChange={(v) => edit(f, v)}
      error={errors[f]}
    />
  );
  const options = () => (
    <div class="option-editor">
      {d.options.map((o, i) => (
        <section class="option-panel" key={o.id} aria-label={`Alternative ${i + 1}`}>
          <TextResponse
            id={`dr-label-${o.id}`}
            label={`Option ${i + 1}`}
            value={o.label}
            limit={300}
            rows={2}
            onChange={(v) => optionEdit(o.id, 'label', v)}
            error={errors[`label-${o.id}`]}
          />
          {d.options.length > 2 && (
            <button
              type="button"
              class="text-button"
              aria-label={`Remove option ${i + 1}`}
              onClick={() =>
                o.label || o.tradeoff || o.reversibility ? setRemoving(o.id) : removeOption(o.id)
              }
            >
              Remove option
            </button>
          )}
        </section>
      ))}
      <button
        id="add-option"
        type="button"
        class="button"
        disabled={d.options.length >= 4}
        onClick={() => {
          const o = newOption();
          setSession((old) => ({
            ...old,
            decision: { ...old.decision, options: [...old.decision.options, o] },
          }));
          requestAnimationFrame(() => document.getElementById(`dr-label-${o.id}`)?.focus());
        }}
      >
        Add an option
      </button>
      <p class="small">Two to four options. No option is added automatically.</p>
    </div>
  );
  const practical = () => (
    <div>
      {d.options.map((o) => (
        <fieldset class="option-panel" key={o.id}>
          <legend class="answer">{o.label}</legend>
          <TextResponse
            id={`dr-tradeoff-${o.id}`}
            label="Costs, risks, and requirements"
            value={o.tradeoff}
            limit={2000}
            onChange={(v) => optionEdit(o.id, 'tradeoff', v)}
            error={errors[`tradeoff-${o.id}`]}
            hint="Include consequences, time, or prerequisites that matter. If something is unknown, say so."
          />
          <label class="select-label" for={`dr-reversibility-${o.id}`}>
            Reversibility
          </label>
          <select
            id={`dr-reversibility-${o.id}`}
            value={o.reversibility}
            aria-required="true"
            aria-invalid={!!errors[`reversibility-${o.id}`]}
            aria-describedby={
              errors[`reversibility-${o.id}`] ? `reversal-error-${o.id}` : undefined
            }
            onChange={(e) => optionEdit(o.id, 'reversibility', e.currentTarget.value)}
          >
            <option value="" disabled>
              Choose a description
            </option>
            {reversibilities.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          {errors[`reversibility-${o.id}`] && (
            <p id={`reversal-error-${o.id}`} class="error" role="alert">
              {errors[`reversibility-${o.id}`]}
            </p>
          )}
        </fieldset>
      ))}
    </div>
  );
  const readiness = () => (
    <fieldset aria-describedby={errors.readiness ? 'dr-readiness-error' : undefined}>
      <legend>Choose what fits now.</legend>
      <div class="choices">
        {decisionReadiness.map(([v, label], i) => (
          <label class="choice" key={v}>
            <input
              id={i === 0 ? 'dr-readiness' : undefined}
              type="radio"
              name="decision-readiness"
              checked={session.readiness === v}
              onChange={() => {
                setSession((old) => ({
                  ...old,
                  readiness: v,
                  decision: {
                    ...old.decision,
                    chosenId: v === 'ready' ? old.decision.chosenId : '',
                  },
                }));
                setErrors({});
              }}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {errors.readiness && (
        <p id="dr-readiness-error" class="error" role="alert">
          {errors.readiness}
        </p>
      )}
    </fieldset>
  );
  const choice = () => (
    <fieldset aria-describedby={errors.choice ? 'dr-choice-error' : undefined}>
      <legend>Your choice</legend>
      <div class="choices neutral-options">
        {d.options.map((o, i) => (
          <label class="choice" key={o.id}>
            <input
              id={i === 0 ? 'dr-choice' : undefined}
              type="radio"
              name="decision-choice"
              checked={d.chosenId === o.id}
              onChange={() => {
                setSession((old) => ({ ...old, decision: { ...old.decision, chosenId: o.id } }));
                setErrors({});
              }}
            />
            <span class="answer">{o.label}</span>
          </label>
        ))}
      </div>
      {errors.choice && (
        <p id="dr-choice-error" class="error" role="alert">
          {errors.choice}
        </p>
      )}
      <p class="small">Any selected state reflects your choice alone.</p>
    </fieldset>
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(decisionText(d));
      setStatus('Decision Record copied.');
      setFallback(false);
    } catch {
      setStatus('Copy was blocked. Select and copy the plain text below.');
      setFallback(true);
    }
  }
  function save() {
    setDialog(null);
    try {
      if (session.savedKey && !session.savedRaw) throw new CardStorageError('changed');
      const entry = saveDecision(
        browserStorage(),
        d,
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
          ? 'Not saved. This record changed or was deleted in another tab. Copy your words before reopening it from Saved work.'
          : code === 'full'
            ? 'Not saved. This browser holds 50 app records. Delete an unneeded record or copy this Decision Record.'
            : 'Save could not be verified. Browser storage may be blocked or full. Your record remains here to copy or print. Check Saved work before retrying.',
      );
      work.refresh();
    }
  }
  function handoffValid() {
    if (!handoff) return false;
    const next: Record<string, string> = {};
    if (handoff.includeSituation && textError(handoff.situation, 2000, 'situation'))
      next['handoff-situation'] = textError(handoff.situation, 2000, 'situation');
    if (handoff.includeAction && textError(handoff.action, 2000, 'action'))
      next['handoff-action'] = textError(handoff.action, 2000, 'action');
    return report(next);
  }
  function transfer() {
    if (!handoff || !handoffValid()) return;
    work.setSession({
      ...newSession(),
      fromDecision: true,
      card: {
        ...newSession().card,
        situation: handoff.includeSituation ? handoff.situation : '',
        action: handoff.includeAction ? handoff.action : '',
      },
    });
    setDialog(null);
    setHandoff(null);
    go('record');
    location.hash = '/tools/next-move';
  }
  const lesson =
    step in decisionLessons ? decisionLessons[step as keyof typeof decisionLessons] : null;
  const isLens = lenses.includes(step as (typeof lenses)[number]);
  const titles: Partial<Record<DecisionStep, string>> = {
    review: 'Review your decision.',
    record: 'Your direction is recorded.',
    pause: 'You can leave this undecided.',
    handoff: 'Choose what to take into Next Move.',
  };
  const isSaved =
    session.savedRaw && JSON.stringify(JSON.parse(session.savedRaw).decision) === JSON.stringify(d);
  return (
    <div class="decision-room work-width">
      <header class="work-header no-print">
        <div>
          <p class="eyebrow">Decision Room</p>
          <h1 ref={heading} tabIndex={-1}>
            {lesson && 'heading' in lesson
              ? String(lesson.heading)
              : lesson?.question || titles[step]}
          </h1>
        </div>
        <p class="work-orientation">
          {isLens
            ? `PERIOD lens ${lenses.indexOf(step as (typeof lenses)[number]) + 1} of 6`
            : step === 'record'
              ? 'A record to take with you'
              : 'Your options. Your direction.'}
        </p>
      </header>
      {step === 'define' && (
        <p class="decision-entry no-print">
          Compare meaningful alternatives and leave with your own reason for choosing. Already know
          your direction? <a href="#/tools/next-move">Open Next Move</a> to define the action.
        </p>
      )}
      {lesson && (
        <div class="work-layout">
          <aside class="work-lesson" aria-label="A useful distinction">
            <h2>{lesson.title}</h2>
            <p>{lesson.text}</p>
            {'example' in lesson && (
              <details class="lesson-example">
                <summary>See a decision example</summary>
                <p>{String(lesson.example)}</p>
              </details>
            )}
            {(isLens || step === 'uncertainty' || step === 'readiness' || step === 'choice') && (
              <details class="comparison-context">
                <summary>Your comparison</summary>
                <p class="answer">{d.decision}</p>
                <ul>
                  {d.options.map((o) => (
                    <li class="answer" key={o.id}>
                      {o.label}
                    </li>
                  ))}
                </ul>
                <p class="small">What matters</p>
                <p class="answer">{d.matters}</p>
              </details>
            )}
          </aside>
          <form
            class="work-panel"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              advance();
            }}
          >
            {step === 'define' && field('decision', lesson.question)}
            {step === 'options' && options()}
            {step === 'matters' && field('matters', lesson.question)}
            {isLens && (
              <>
                <p class="field-hint">
                  Compare the options together in your own words. Mention the option names where
                  useful; there is no score to earn.
                </p>
                {field(step as DecisionField, lesson.question)}
              </>
            )}
            {step === 'practical' && practical()}
            {step === 'uncertainty' && field('uncertainty', lesson.question)}
            {step === 'readiness' && readiness()}
            {step === 'choice' && choice()}
            {step === 'reason' && (
              <>
                <p class="small">Your chosen option</p>
                <p class="chosen-context answer">
                  {d.options.find((o) => o.id === d.chosenId)?.label}
                </p>
                {field('rationale', 'Why are you choosing this option?')}
                {field('firstMove', 'What is the first thing this decision requires from you?')}
              </>
            )}
            <div class="actions workflow-actions">
              {step !== 'define' && (
                <button
                  type="button"
                  class="button"
                  onClick={() => go(decisionSteps[decisionSteps.indexOf(step) - 1])}
                >
                  Back
                </button>
              )}
              <button class="button primary" type="submit">
                {step === 'reason'
                  ? 'Review my decision'
                  : step === 'readiness' && session.readiness && session.readiness !== 'ready'
                    ? 'Pause here'
                    : 'Next'}
              </button>
            </div>
          </form>
        </div>
      )}
      {step === 'pause' && (
        <section class="pause-panel">
          <p class="eyebrow">No decision forced</p>
          <h2>Give the unresolved part attention.</h2>
          <p>{decisionReadiness.find(([v]) => v === session.readiness)?.[1]}</p>
          <p>
            No Decided record has been created for this pause. Your words remain in memory while
            this tab stays open. Earlier saved records stay saved. You can return to the comparison
            or leave without a conclusion.
          </p>
          <div class="actions">
            <button class="button" onClick={() => go('readiness')}>
              Return to readiness
            </button>
            <button class="button" onClick={() => go('options')}>
              Reconsider options
            </button>
            <a href="#/">Leave the tool</a>
          </div>
        </section>
      )}
      {step === 'review' && (
        <form
          class="review-panel"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (validate(true) && validDecision(d) && session.readiness === 'ready') go('record');
          }}
        >
          <p class="review-intro">
            Read this as a record you will use later. Edit any wording. If an option changes,
            revisit its tradeoffs and your reasons before confirming.
          </p>
          {field('decision')}
          <h2>Options considered</h2>
          {options()}
          {field('matters')}
          <h2>PERIOD reflections</h2>
          {lenses.map((f) => field(f))}
          <h2>Practical tradeoffs</h2>
          {practical()}
          {field('uncertainty')}
          {choice()}
          {field('rationale')}
          {field('firstMove')}
          <div class="planned-note">
            <strong>Status after confirmation: Decided</strong>
            <p>
              This records your choice, not action, success, or certainty. Confirmation remains
              editable.
            </p>
          </div>
          <div class="actions">
            <button type="button" class="button" onClick={() => go('readiness')}>
              Revisit readiness
            </button>
            <button class="button primary" type="submit">
              Confirm my decision
            </button>
          </div>
        </form>
      )}
      {step === 'record' && (
        <>
          <DecisionRecord decision={d} />
          <section class="artifact-actions no-print" aria-label="Use your Decision Record">
            <p class="take-away">This record is yours to keep. You can leave here.</p>
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
                ? 'This wording is saved in this browser profile.'
                : 'In memory only unless you explicitly save. Changes do not update a saved record automatically.'}
            </p>
            <p class="small">Clipboard sync, printouts, and PDFs are outside local deletion.</p>
            {fallback && (
              <div class="copy-fallback">
                <label for="decision-copy">Decision Record plain text</label>
                <textarea
                  id="decision-copy"
                  ref={copyArea}
                  readOnly
                  value={decisionText(d)}
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
            <section class="handoff-offer">
              <h2>If you want to define the action</h2>
              <p>
                Next Move can turn your first move into an action plan. You choose which text to
                carry, and can change it there.
              </p>
              <button
                class="button"
                onClick={() => {
                  setHandoff(prepareHandoff(d));
                  go('handoff');
                }}
              >
                Turn this decision into a Next Move
              </button>
            </section>
          </section>
        </>
      )}
      {step === 'handoff' && handoff && (
        <section class="review-panel">
          <p>
            Only the fields you include move within this tab. Your Decision Record stays here.
            Nothing is saved or sent. Next Move still checks readiness, obstacles, start condition,
            and completion.
          </p>
          {(['situation', 'action'] as const).map((f) => {
            const include = f === 'situation' ? 'includeSituation' : 'includeAction';
            return (
              <section key={f}>
                <label class="choice">
                  <input
                    type="checkbox"
                    checked={handoff[include]}
                    onChange={(e) => setHandoff({ ...handoff, [include]: e.currentTarget.checked })}
                  />
                  <span>
                    Include {f === 'situation' ? 'decision as situation' : 'first move as action'}
                  </span>
                </label>
                {handoff[include] && (
                  <TextResponse
                    id={`dr-handoff-${f}`}
                    label={f === 'situation' ? 'Situation to carry' : 'Action to carry'}
                    value={handoff[f]}
                    limit={2000}
                    error={errors[`handoff-${f}`]}
                    onChange={(v) => setHandoff({ ...handoff, [f]: v })}
                  />
                )}
              </section>
            );
          })}
          <div class="actions">
            <button
              class="button"
              onClick={() => {
                setHandoff(null);
                go('record');
              }}
            >
              Cancel handoff
            </button>
            <button
              class="button primary"
              onClick={() => {
                if (!handoffValid()) return;
                if (
                  Object.values(work.session.card).some(Boolean) ||
                  work.session.readiness ||
                  work.session.obstacleKind
                )
                  setDialog('replace');
                else transfer();
              }}
            >
              Continue into Next Move
            </button>
          </div>
        </section>
      )}
      <p class="work-status no-print" role="status">
        {status}
      </p>
      <footer class="work-footer no-print">
        <div>
          <SourceNote items={['period']} />
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
          confirm={session.savedKey ? 'Save these changes' : 'Save this record'}
          onCancel={() => setDialog(null)}
          onConfirm={save}
        >
          <LocalNotice artifact="Decision Record" />
        </ConfirmDialog>
      )}
      {dialog === 'clear' && (
        <ConfirmDialog
          title="Clear current work?"
          confirm="Clear current work"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setSession(newDecisionSession());
            setDialog(null);
          }}
        >
          <p>
            This clears the current Decision Room session. Saved records and Next Move work stay
            until you delete them.
          </p>
        </ConfirmDialog>
      )}
      {dialog === 'replace' && (
        <ConfirmDialog
          title="Replace current Next Move work?"
          confirm="Replace and open Next Move"
          onCancel={() => setDialog(null)}
          onConfirm={transfer}
        >
          <p>
            This will replace the Next Move session already open in this tab. Unsaved words in that
            session will be lost. Cancel to copy or save them first. Saved Execution Cards will not
            change.
          </p>
        </ConfirmDialog>
      )}
      {removing && (
        <ConfirmDialog
          title="Remove this option?"
          confirm="Remove option"
          onCancel={() => setRemoving(null)}
          onConfirm={() => removeOption(removing)}
        >
          <p class="answer">{d.options.find((o) => o.id === removing)?.label}</p>
          <p>
            Its tradeoffs will be removed from the current work. Reflections are kept exactly as
            written; you may need to revise references to this option.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
