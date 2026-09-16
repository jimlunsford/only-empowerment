import { useEffect, useRef, useState } from 'preact/hooks';
import { Lesson, PageIntro, SourceNote } from './components/shared';
import { MAX_RESPONSE, previewText, validateResponse } from './preview-model.mjs';
export function Preview() {
  const [action, setAction] = useState('');
  const [step, setStep] = useState<'write' | 'review'>('write');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const question = useRef<HTMLTextAreaElement>(null);
  const output = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (step === 'review') output.current?.focus();
  }, [step]);
  function review() {
    const message = validateResponse(action);
    setError(message);
    setStatus('');
    if (message) question.current?.focus();
    else setStep('review');
  }
  function clear() {
    setAction('');
    setError('');
    setStep('write');
    setConfirmClear(false);
    setStatus('Preview cleared. Nothing was saved by the app.');
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(previewText(action));
      setStatus('Copied. Your clipboard may be available to other apps or synced devices.');
    } catch {
      setStatus('Copy is unavailable. Select the text on the card and copy it manually.');
    }
  }
  return (
    <div class="narrow">
      <div class="no-print">
        <PageIntro label="Interaction preview" title="A small look at how the tools will work.">
          <p>
            This is a limited design preview, not the Next Move tool. Try it with an ordinary
            example. Your text stays in this page and is not saved by the app.
          </p>
        </PageIntro>
        <ol class="progress" aria-label="Preview progress">
          <li aria-current={step === 'write' ? 'step' : undefined}>1. Reflect</li>
          <li aria-current={step === 'review' ? 'step' : undefined}>2. Review a card</li>
        </ol>
      </div>
      {step === 'write' ? (
        <div class="preview-layout">
          <Lesson title="An action needs an edge.">
            <p>
              “Make progress” leaves you guessing where to start and when to stop. An executable
              action names something you can do and a point where it is done.
            </p>
            <p>For example: clear one surface, send one question, or write the first paragraph.</p>
          </Lesson>
          <section class="question-panel" aria-labelledby="question-title">
            <h2 id="question-title">
              <label for="sample-action">What is one action you could finish?</label>
            </h2>
            <p id="action-hint">
              Name the action and what would count as done. This preview does not assess your
              answer.
            </p>
            <textarea
              id="sample-action"
              ref={question}
              value={action}
              maxLength={MAX_RESPONSE}
              rows={4}
              autoComplete="off"
              spellcheck={false}
              aria-describedby={`action-hint action-limit${error ? ' action-error' : ''}`}
              aria-invalid={Boolean(error)}
              onInput={(e) => {
                setAction(e.currentTarget.value);
                if (error) setError('');
              }}
            />
            <p id="action-limit" class="small">
              Up to {MAX_RESPONSE} characters.
            </p>
            {error && (
              <p id="action-error" role="alert" class="error">
                {error}
              </p>
            )}
            <button class="button primary" onClick={review}>
              Review the sample card <span aria-hidden="true">↗</span>
            </button>
          </section>
        </div>
      ) : (
        <>
          <article class="output-card">
            <p class="eyebrow">Only Empowerment · Workflow preview</p>
            <h2 ref={output} tabIndex={-1}>
              Sample action card
            </h2>
            <p class="output-label">The action you named</p>
            <p class="answer">{action.trim()}</p>
            <div class="output-status">
              <strong>Planned</strong>
              <p>Creating a card is not completing the action. The work happens after this.</p>
            </div>
            <p class="small">Preview only. This is not a finished tool.</p>
            <p class="print-only">Built by Jim Lunsford · https://jimlunsford.com/</p>
          </article>
          <div class="actions no-print">
            <button class="button primary" onClick={copy}>
              Copy card
            </button>
            <button class="button" onClick={() => window.print()}>
              Print card
            </button>
            <button
              class="text-button"
              onClick={() => {
                setStep('write');
                setStatus('');
              }}
            >
              Edit response
            </button>
          </div>
          <p class="small no-print">
            Copy and print are optional. Clipboard sync, saved PDFs, and printer systems have their
            own privacy settings.
          </p>
        </>
      )}
      <div class="preview-footer no-print">
        <p role="status">{status}</p>
        {confirmClear ? (
          <div class="clear-confirm">
            <p>Clear the response in this preview? The app cannot restore it.</p>
            <button class="button" onClick={clear}>
              Clear this preview
            </button>
            <button class="text-button" onClick={() => setConfirmClear(false)}>
              Keep working
            </button>
          </div>
        ) : (
          <button class="text-button" onClick={() => setConfirmClear(true)}>
            Clear preview
          </button>
        )}
        <SourceNote items={['execution']} />
        <p class="small">
          Refreshing or leaving this preview discards the app’s in-memory response. Your browser,
          device, or extensions may retain information outside the app’s control.
        </p>
      </div>
    </div>
  );
}
