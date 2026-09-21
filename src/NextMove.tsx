import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { SourceNote } from './components/shared';
import { ConfirmDialog, ExecutionCard, FieldInput, LocalNotice } from './components/work';
import {
  cardText,
  fields,
  labels,
  newSession,
  readinessChoices,
  validateField,
  type Field,
  type Step,
} from './next-move-model';
import { lessons } from './next-move-lessons';
import { browserStorage, saveCard, CardStorageError } from './local-cards';
import { broadcast, type LocalWork } from './use-local-work';
export function NextMove({ work }: { work: LocalWork }) {
  const { session, setSession } = work;
  const { step, card } = session;
  const [errors, setErrors] = useState<Partial<Record<Field | 'choice', string>>>({});
  const [status, setStatus] = useState('');
  const [dialog, setDialog] = useState<'save' | 'clear' | null>(null);
  const [fallback, setFallback] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const copyArea = useRef<HTMLTextAreaElement>(null);
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
  // Cross-tab deletion must also discard ephemeral copy text, notices and open confirmations.
  useEffect(() => {
    if (!card.situation && step === 0) {
      setFallback(false);
      setDialog(null);
      setStatus('');
    }
  }, [card, step]);
  function go(next: Step) {
    setSession((old) => ({ ...old, step: next }));
  }
  function edit(field: Field, value: string) {
    setSession((old) => ({ ...old, card: { ...old.card, [field]: value } }));
    setErrors((old) => ({ ...old, [field]: '' }));
  }
  function check(list: readonly Field[]) {
    const next: Partial<Record<Field, string>> = {};
    for (const f of list) {
      const error = validateField(f, card[f]);
      if (error) next[f] = error;
    }
    setErrors(next);
    const first = list.find((f) => next[f]);
    if (first) document.getElementById(`field-${first}`)?.focus();
    return !first;
  }
  function advance() {
    if (typeof step !== 'number') return;
    if (step === 2) {
      if (!session.readiness) {
        setErrors({ choice: 'Choose what fits, including not being ready.' });
        document.getElementById('ready')?.focus();
        return;
      }
      go(session.readiness === 'ready' ? 3 : 'pause');
      return;
    }
    const field = lessons[step].field as Field;
    if (!check([field])) return;
    if (step === 3) {
      if (!session.obstacleKind) {
        setErrors({ choice: 'Choose whether this is workable friction or a blocker.' });
        document.getElementById('friction')?.focus();
        return;
      }
      if (session.obstacleKind === 'blocker') {
        go('pause');
        return;
      }
    }
    go(step === 5 ? 'review' : ((step + 1) as Step));
  }
  async function copy() {
    setStatus('');
    try {
      await navigator.clipboard.writeText(cardText(card));
      setStatus('Execution Card copied.');
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
      const saved = saveCard(
        browserStorage(),
        card,
        session.savedKey && session.savedRaw
          ? { key: session.savedKey, raw: session.savedRaw }
          : undefined,
      );
      setSession((old) => ({ ...old, savedKey: saved.key, savedRaw: saved.raw }));
      work.refresh();
      broadcast({ type: 'refresh' });
      setStatus('Saved on this device.');
    } catch (error) {
      const code = error instanceof CardStorageError ? error.message : '';
      setStatus(
        code === 'changed'
          ? 'Not saved. This saved record changed or was deleted in another tab. Reopen it from Saved on this device before editing; copy this plan first if you want to keep these words.'
          : code === 'full'
            ? 'Not saved. This browser holds 50 app records. Delete an unneeded record and try again, or copy this card.'
            : 'Save could not be verified. Browser storage may be blocked or full. Your card remains here to copy or print. Check Saved on this device before retrying.',
      );
      work.refresh();
    }
  }
  const isSaved =
    session.savedRaw && JSON.stringify(JSON.parse(session.savedRaw).card) === JSON.stringify(card);
  const number = typeof step === 'number' ? step : null;
  const lesson = number === null ? null : lessons[number];
  const title =
    step === 'review'
      ? 'Review your plan.'
      : step === 'card'
        ? 'Your next move is defined.'
        : step === 'pause'
          ? 'You can pause here.'
          : lesson!.question;
  return (
    <div class="next-move work-width">
      <header class="work-header no-print">
        <div>
          <p class="eyebrow">Next Move</p>
          <h1 ref={heading} tabIndex={-1}>
            {title}
          </h1>
        </div>
        <p class="work-orientation">
          {number !== null
            ? `Step ${number + 1} of 6`
            : step === 'review'
              ? 'Review before confirming'
              : step === 'card'
                ? 'A plan to take with you'
                : 'No action plan required'}
        </p>
      </header>
      {session.fromDecision && (
        <p class="storage-notice no-print">
          Opened from your Decision Record. Any text you chose to carry is editable. Next Move still
          needs its own readiness check and action plan.
        </p>
      )}
      {lesson && number !== null && (
        <div class="work-layout">
          <aside class="work-lesson" aria-label="A useful distinction">
            <span class="lesson-number" aria-hidden="true">
              0{number + 1}
            </span>
            <h2>{lesson.title}</h2>
            <p>{lesson.text}</p>
            {lesson.example && (
              <details class="lesson-example">
                <summary>See an action example</summary>
                <p>{lesson.example}</p>
              </details>
            )}
          </aside>
          <form
            key={number}
            class="work-panel"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              advance();
            }}
          >
            {number === 2 ? (
              <fieldset aria-describedby={errors.choice ? 'choice-error' : undefined}>
                <legend>Choose what fits your situation.</legend>
                <div class="choices">
                  {readinessChoices.map(([value, label]) => (
                    <label class="choice" key={value}>
                      <input
                        id={value}
                        type="radio"
                        name="readiness"
                        value={value}
                        checked={session.readiness === value}
                        onChange={() => {
                          setSession((old) => ({ ...old, readiness: value }));
                          setErrors({});
                        }}
                      />{' '}
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <FieldInput
                field={lesson.field as Field}
                value={card[lesson.field as Field]}
                question={lesson.question}
                onChange={(value) => edit(lesson.field as Field, value)}
                error={errors[lesson.field as Field]}
                hint={
                  number === 0
                    ? 'Keep only the context you want on your card.'
                    : number === 4
                      ? 'For example: after lunch, when permission arrives, or after leaving this tool.'
                      : number === 3
                        ? 'If none is apparent, say so. The tool does not classify your answer.'
                        : undefined
                }
              />
            )}
            {number === 3 && (
              <fieldset aria-describedby={errors.choice ? 'choice-error' : undefined}>
                <legend>How does that affect this action?</legend>
                <div class="choices">
                  {[
                    ['friction', 'I can plan around it, or no obstacle is apparent.'],
                    ['blocker', 'It is a real blocker or I am unsure.'],
                  ].map(([value, label]) => (
                    <label class="choice" key={value}>
                      <input
                        id={value}
                        type="radio"
                        name="obstacle-kind"
                        checked={session.obstacleKind === value}
                        onChange={() => {
                          setSession((old) => ({ ...old, obstacleKind: value }));
                          setErrors({});
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {errors.choice && (
              <p id="choice-error" class="error" role="alert">
                {errors.choice}
              </p>
            )}
            <div class="actions workflow-actions">
              {number > 0 && (
                <button type="button" class="button" onClick={() => go((number - 1) as Step)}>
                  Back
                </button>
              )}
              <button class="button primary" type="submit">
                {number === 5
                  ? 'Review my plan'
                  : (number === 2 && session.readiness && session.readiness !== 'ready') ||
                      (number === 3 && session.obstacleKind === 'blocker')
                    ? 'Pause here'
                    : 'Next'}
              </button>
            </div>
          </form>
        </div>
      )}
      {step === 'pause' && (
        <section class="pause-panel">
          <p class="eyebrow">A legitimate stopping point</p>
          <h2>Resolve what matters before execution.</h2>
          <p>
            {session.readiness === 'decision'
              ? 'Comparing meaningful alternatives belongs in Decision Room. Take the time to make the decision before turning it into an action plan.'
              : 'Information, permission, resources, safety, support, or changed circumstances can change the plan. You decide whether to wait, seek help, or choose a different action.'}
          </p>
          <p>
            This pause does not finalize an Execution Card. Earlier saved cards remain saved. Your
            words remain in memory while this page stays open. You can leave or return when the
            situation is clearer.
          </p>
          <div class="actions">
            {session.readiness === 'decision' && (
              <a class="button" href="#/tools/decision-room">
                Open Decision Room
              </a>
            )}
            <button class="button" onClick={() => go(1)}>
              Reconsider my action
            </button>
            <button
              class="text-button"
              onClick={() => {
                setSession((old) => ({ ...old, obstacleKind: '', step: 2 }));
              }}
            >
              Return to readiness
            </button>
            <a href="#/" class="quiet-link">
              Leave the tool
            </a>
          </div>
        </section>
      )}
      {step === 'review' && (
        <form
          class="review-panel"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (check(fields)) go('card');
          }}
        >
          <p class="review-intro">
            Read this as a card you will use later. Edit any wording. Keep the finish tied to your
            action, even when the outcome depends on someone else.
          </p>
          {fields.map((field) => (
            <FieldInput
              key={field}
              field={field}
              value={card[field]}
              onChange={(value) => edit(field, value)}
              error={errors[field]}
            />
          ))}
          <div class="planned-note">
            <strong>Status: Planned</strong>
            <p>
              Confirming records an intention. It does not record an attempt or completed action.
            </p>
          </div>
          <div class="actions">
            <button type="button" class="button" onClick={() => go(5)}>
              Back
            </button>
            <button type="submit" class="button primary">
              Confirm my plan
            </button>
          </div>
        </form>
      )}
      {step === 'card' && (
        <>
          <ExecutionCard card={card} />
          <section class="artifact-actions no-print" aria-label="Use your Execution Card">
            <p class="take-away">
              Take the Execution Card and act when your start condition is met.
            </p>
            <div class="actions">
              <button class="button primary" onClick={copy}>
                Copy card
              </button>
              <button class="button" onClick={() => window.print()}>
                Print card
              </button>
              <button class="button" onClick={() => setDialog('save')}>
                {session.savedKey ? 'Save changes on this device' : 'Save on this device'}
              </button>
              <button class="text-button" onClick={() => go('review')}>
                Edit card
              </button>
            </div>
            <p class="small">
              {isSaved
                ? 'This wording is saved in this browser profile.'
                : session.savedKey
                  ? 'Changes are in memory. Saving requires your choice.'
                  : 'In memory only. Nothing is saved unless you choose to save.'}
            </p>
            <p class="small">
              Copy and print are optional. Clipboard sync, saved PDFs, and printers are outside
              local deletion.
            </p>
            {fallback && (
              <div class="copy-fallback">
                <label for="manual-copy">Execution Card plain text</label>
                <textarea
                  id="manual-copy"
                  ref={copyArea}
                  readOnly
                  value={cardText(card)}
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
          <SourceNote items={['execution']} />
          <p class="small">
            Your words stay in memory during navigation within this site. Reloading or closing the
            tab can discard unsaved work. You can stop at any time.
          </p>
        </div>
        <button class="text-button" onClick={() => setDialog('clear')}>
          Clear current work
        </button>
      </footer>
      {dialog === 'save' && (
        <ConfirmDialog
          title="Save on this device?"
          confirm={session.savedKey ? 'Save these changes' : 'Save this card'}
          onCancel={() => setDialog(null)}
          onConfirm={save}
        >
          <LocalNotice />
        </ConfirmDialog>
      )}
      {dialog === 'clear' && (
        <ConfirmDialog
          title="Clear current work?"
          confirm="Clear current work"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setSession(newSession());
            setDialog(null);
          }}
        >
          <p>
            This clears the current Next Move session. Any saved card stays in Saved on this device
            until you delete it.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
