import { hasActionWork, receiveActionHandoff } from './do-it-now-model';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { SourceNote } from './components/shared';
import {
  ConfirmDialog,
  ExecutionCard,
  FieldInput,
  LocalNotice,
  TextResponse,
} from './components/work';
import {
  cardText,
  handoffPreview,
  type Card,
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
  const [dialog, setDialog] = useState<'save' | 'clear' | 'replace-action' | null>(null);
  const [fallback, setFallback] = useState(false);
  const [handoff, setHandoff] = useState<Card | null>(null);
  const [includeStart, setIncludeStart] = useState(true);
  const [includeCompletion, setIncludeCompletion] = useState(true);
  const handoffHeading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    if (handoff) handoffHeading.current?.focus();
  }, [!!handoff]);
  const heading = useRef<HTMLHeadingElement>(null);
  const copyArea = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    heading.current?.focus();
    setErrors({});
    setStatus('');
    setFallback(false);
    setHandoff(null);
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
      setHandoff(null);
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
  function prepareTransfer() {
    if (!handoff) return null;
    const selected: ('action' | 'start' | 'completion')[] = ['action'];
    if (includeStart) selected.push('start');
    if (includeCompletion) selected.push('completion');
    const next: Partial<Record<Field, string>> = {};
    for (const f of selected) {
      const error = validateField(f, handoff[f]);
      if (error) next[f] = error;
    }
    setErrors(next);
    const first = selected.find((f) => next[f]);
    if (first) {
      document.getElementById('nm-carry-' + first)?.focus();
      return null;
    }
    return receiveActionHandoff(handoffPreview(handoff, selected));
  }
  function transfer() {
    const received = prepareTransfer();
    if (!received) return;
    work.setActionSession(received);
    setDialog(null);
    setHandoff(null);
    location.hash = '/tools/do-it-now';
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
      {session.fromRebuild && (
        <p class="storage-notice no-print">
          Opened from your Rebuild Map. Any text you chose to carry is editable. Next Move still
          needs its own readiness check and action plan. Nothing was saved automatically.
        </p>
      )}
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
      {step === 'card' && !handoff && (
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
            <section class="handoff-offer">
              <h2>If the action is ready to begin</h2>
              <p>
                Do It Now can help you begin and report the result. Your plan is already yours to
                use. Continuing is optional.
              </p>
              <button
                class="button"
                onClick={() => {
                  setHandoff({ ...card });
                  setIncludeStart(true);
                  setIncludeCompletion(true);
                }}
              >
                Do it now
              </button>
            </section>
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
      {step === 'card' && handoff && (
        <section class="review-panel no-print">
          <h2 ref={handoffHeading} tabIndex={-1}>
            Review what goes into Do It Now.
          </h2>
          <p>
            Only the included text moves within this tab. Your Execution Card stays unchanged.
            Nothing is saved automatically. Do It Now still asks whether you can begin.
          </p>
          <TextResponse
            id="nm-carry-action"
            label="My next move to carry"
            value={handoff.action}
            limit={2000}
            error={errors.action}
            onChange={(v) => setHandoff({ ...handoff, action: v })}
          />
          <p class="small">The action is required.</p>
          <label class="choice">
            <input
              type="checkbox"
              checked={includeStart}
              onChange={(e) => setIncludeStart(e.currentTarget.checked)}
            />
            <span>Include start condition</span>
          </label>
          {includeStart && (
            <TextResponse
              id="nm-carry-start"
              label="Start condition to carry"
              value={handoff.start}
              limit={1000}
              error={errors.start}
              onChange={(v) => setHandoff({ ...handoff, start: v })}
            />
          )}
          <label class="choice">
            <input
              type="checkbox"
              checked={includeCompletion}
              onChange={(e) => setIncludeCompletion(e.currentTarget.checked)}
            />
            <span>Include completion boundary</span>
          </label>
          {includeCompletion && (
            <TextResponse
              id="nm-carry-completion"
              label="Completion boundary to carry"
              value={handoff.completion}
              limit={2000}
              error={errors.completion}
              onChange={(v) => setHandoff({ ...handoff, completion: v })}
            />
          )}
          <div class="actions">
            <button
              class="button"
              onClick={() => {
                setHandoff(null);
                setErrors({});
                requestAnimationFrame(() => heading.current?.focus());
              }}
            >
              Cancel handoff
            </button>
            <button
              class="button primary"
              onClick={() => {
                if (!prepareTransfer()) return;
                if (hasActionWork(work.actionSession)) setDialog('replace-action');
                else transfer();
              }}
            >
              Continue into Do It Now
            </button>
          </div>
        </section>
      )}
      {dialog === 'replace-action' && (
        <ConfirmDialog
          title="Replace current Do It Now work?"
          confirm="Replace and open Do It Now"
          onCancel={() => setDialog(null)}
          onConfirm={transfer}
        >
          <p>
            {work.actionSession.started
              ? work.actionSession.step === 'record'
                ? 'An Action Record is open in this tab.'
                : 'You already reported starting an action in this tab.'
              : 'You have an unstarted Do It Now session in this tab.'}{' '}
            Replacing it discards that session and any active timer. Saved Action Records stay
            unchanged.
          </p>
          <p>
            Cancel to keep the current work. You can return to Do It Now to copy or save a confirmed
            record first.
          </p>
        </ConfirmDialog>
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
