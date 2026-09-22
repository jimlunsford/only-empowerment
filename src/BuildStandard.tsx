import { renderStandardText } from './components/artifact-text';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { TextResponse, ConfirmDialog, LocalNotice } from './components/work';
import { SourceNote } from './components/shared';
import {
  standardFields,
  standardLabels,
  standardSteps,
  standardStepFields,
  standardErrors,
  standardText,
  validStandard,
  newStandardSession,
  STANDARD_TEXT_LIMIT,
  STANDARD_ITEM_LIMIT,
  STANDARD_LIST_MAX,
  type Standard,
  type StandardField,
  type StandardList,
  type StandardStep,
} from './standard-model';
import { standardLessons } from './standard-lessons';
import { browserStorage, CardStorageError } from './local-cards';
import { saveStandard } from './local-standards';
import { broadcast, type LocalWork } from './use-local-work';

export function PersonalStandard({
  standard: s,
  review = false,
  editor,
}: {
  standard: Standard;
  review?: boolean;
  editor?: (field: StandardField) => ComponentChildren;
}) {
  return (
    <article class="output-card execution-card personal-standard" aria-labelledby="standard-title">
      <div class="artifact-header">
        <p class="eyebrow">Only Empowerment · Build a Standard</p>
        {!review && <span class="planned-badge">Status: Set</span>}
      </div>
      <h2 id="standard-title" tabIndex={-1}>
        Personal Standard{review ? ' review' : ''}
      </h2>
      {standardFields.map((f) => (
        <section class={`artifact-section standard-${f}`} key={f}>
          <h3>{standardLabels[f]}</h3>
          {Array.isArray(s[f]) ? (
            <ul class="standard-behaviors">
              {(s[f] as string[]).map((v, i) => (
                <li key={i} class="answer">
                  {renderStandardText(v)}
                </li>
              ))}
            </ul>
          ) : (
            <p class="answer">{renderStandardText(s[f] as string)}</p>
          )}
          {editor?.(f)}
        </section>
      ))}
      {!review && (
        <>
          <p class="artifact-footnote">
            Set means you chose this standard. It does not mean you have kept or proven it.
          </p>
          <p class="print-only">
            Built by Jim Lunsford · jimlunsford.com
            <br />
            Based on The PERIOD Code and standards doctrine · jimlunsford.com/period-code/
          </p>
        </>
      )}
    </article>
  );
}
export function BuildStandard({ work }: { work: LocalWork }) {
  const { standardSession: session, setStandardSession: setSession } = work;
  const { standard: s, step } = session;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<StandardField | null>(null);
  const [dialog, setDialog] = useState<'save' | 'clear' | null>(null);
  const [removing, setRemoving] = useState<{ field: StandardList; index: number } | null>(null);
  const [fallback, setFallback] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null),
    copyArea = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    heading.current?.focus();
    setErrors({});
    setStatus('');
    setFallback(false);
    setEditing(null);
  }, [step]);
  useEffect(() => {
    if (fallback) {
      copyArea.current?.focus();
      copyArea.current?.select();
    }
  }, [fallback]);
  useEffect(() => {
    if (step === 'context' && !s.area) {
      setDialog(null);
      setRemoving(null);
      setFallback(false);
      setStatus('');
      setEditing(null);
    }
  }, [s, step]);
  function go(next: StandardStep) {
    setSession((old) => ({ ...old, step: next }));
  }
  function edit(field: StandardField, value: string | string[]) {
    setSession((old) => ({ ...old, standard: { ...old.standard, [field]: value } }));
    setErrors((old) =>
      Object.fromEntries(
        Object.entries(old).filter(([k]) => k !== field && !k.startsWith(field + '-')),
      ),
    );
  }
  function validate(fields = standardFields) {
    const next = standardErrors(s, fields);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      if (step === 'review')
        setEditing(standardFields.find((f) => first === f || first.startsWith(f + '-'))!);
      requestAnimationFrame(() => document.getElementById('ps-' + first)?.focus());
    }
    return !first;
  }
  const field = (f: StandardField, label?: string) =>
    f === 'keeping' || f === 'violations' ? (
      list(f)
    ) : (
      <TextResponse
        id={`ps-${f}`}
        label={label || standardLabels[f]}
        value={s[f]}
        limit={STANDARD_TEXT_LIMIT}
        error={errors[f]}
        onChange={(v) => edit(f, v)}
      />
    );
  function list(f: StandardList) {
    return (
      <fieldset class="standard-list-editor">
        <legend>{standardLabels[f]}</legend>
        <p class="field-hint">One to five behaviors. Up to 1,000 characters each.</p>
        {s[f].map((v, i) => (
          <section class="standard-list-item" key={i}>
            <TextResponse
              id={`ps-${f}-${i}`}
              label={`${f === 'keeping' ? 'Keeping' : 'Violating'} behavior ${i + 1}`}
              value={v}
              limit={STANDARD_ITEM_LIMIT}
              rows={3}
              error={errors[`${f}-${i}`]}
              onChange={(value) =>
                edit(
                  f,
                  s[f].map((old, j) => (j === i ? value : old)),
                )
              }
            />
            {s[f].length > 1 && (
              <button
                class="text-button"
                type="button"
                aria-label={`Remove ${f === 'keeping' ? 'keeping' : 'violating'} behavior ${i + 1}`}
                onClick={() => setRemoving({ field: f, index: i })}
              >
                Remove behavior {i + 1}
              </button>
            )}
          </section>
        ))}
        <button
          id={`add-${f}`}
          class="button"
          type="button"
          disabled={s[f].length >= STANDARD_LIST_MAX}
          onClick={() => {
            const index = s[f].length;
            edit(f, [...s[f], '']);
            setStatus('Behavior added.');
            requestAnimationFrame(() => document.getElementById(`ps-${f}-${index}`)?.focus());
          }}
        >
          Add {f === 'keeping' ? 'keeping' : 'violating'} behavior
        </button>
        {s[f].length === STANDARD_LIST_MAX && (
          <p class="small">Five behaviors added. Edit or remove an item to make room.</p>
        )}
      </fieldset>
    );
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(standardText(s));
      setStatus('Personal Standard copied.');
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
      const entry = saveStandard(
        browserStorage(),
        s,
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
            ? 'Not saved. Up to 50 saved Only Empowerment records total. Delete an unneeded record or copy this Personal Standard.'
            : 'Save could not be verified. Browser storage may be blocked or full. Your standard remains here to copy or print. Check Saved work before retrying.',
      );
      work.refresh();
    }
  }
  const lesson = step === 'review' || step === 'record' ? null : standardLessons[step];
  const isSaved =
    session.savedRaw && JSON.stringify(JSON.parse(session.savedRaw).standard) === JSON.stringify(s);
  return (
    <div class="build-standard work-width">
      <header class="work-header no-print">
        <div>
          <p class="eyebrow">Build a Standard</p>
          <h1 ref={heading} tabIndex={-1}>
            {lesson?.heading ||
              (step === 'review' ? 'Review the line you are choosing.' : 'Your standard is set.')}
          </h1>
        </div>
        <p class="work-orientation">
          {lesson
            ? `Step ${standardSteps.indexOf(step as (typeof standardSteps)[number]) + 1} of 7`
            : step === 'review'
              ? 'Your words. Your choice.'
              : 'A standard to take with you'}
        </p>
      </header>
      {step === 'context' && (
        <p class="decision-entry">
          Define a line you can live by, the structure that protects it, and how you will correct a
          miss. You choose the standard. This tool does not assess you.
        </p>
      )}
      {lesson && (
        <div class="work-layout">
          <aside class="work-lesson" aria-label="A useful distinction">
            <h2>{lesson.title}</h2>
            <p>{lesson.text}</p>
            {'example' in lesson && (
              <details class="lesson-example">
                <summary>A useful distinction in practice</summary>
                <p>{lesson.example}</p>
              </details>
            )}
            {step !== 'context' && step !== 'line' && (
              <details class="comparison-context">
                <summary>Your chosen line so far</summary>
                <p class="answer">{s.standard}</p>
                <button class="text-button" type="button" onClick={() => go('line')}>
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
              if (validate(standardStepFields[step as (typeof standardSteps)[number]]))
                go(
                  step === 'correction'
                    ? 'review'
                    : standardSteps[
                        standardSteps.indexOf(step as (typeof standardSteps)[number]) + 1
                      ],
                );
            }}
          >
            {step === 'context' && field('area', lesson.question)}
            {step === 'line' && field('standard', lesson.question)}
            {step === 'reason' && field('reason', lesson.question)}
            {step === 'behavior' && (
              <>
                {list('keeping')}
                {list('violations')}
              </>
            )}
            {step === 'structure' && field('structure', lesson.question)}
            {step === 'pressure' && (
              <>
                {field(
                  'adaptation',
                  'What would justify a deliberate change, and how would you decide?',
                )}
                {field(
                  'nonNegotiation',
                  'What will you not renegotiate merely because it becomes uncomfortable?',
                )}
              </>
            )}
            {step === 'correction' && field('correction', lesson.question)}
            <div class="actions workflow-actions">
              {step !== 'context' && (
                <button
                  type="button"
                  class="button"
                  onClick={() =>
                    go(
                      standardSteps[
                        standardSteps.indexOf(step as (typeof standardSteps)[number]) - 1
                      ],
                    )
                  }
                >
                  Back
                </button>
              )}
              <button type="submit" class="button primary">
                {step === 'correction' ? 'Review my standard' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      )}
      {step === 'review' && (
        <>
          <p class="review-intro">
            Read this as something you will keep. Does the line describe behavior you own? Can you
            recognize both keeping it and crossing it? Edit any section before choosing it as your
            standard.
          </p>
          <PersonalStandard
            standard={s}
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
                          requestAnimationFrame(() =>
                            document.getElementById(`edit-${f}`)?.focus(),
                          );
                        }
                      }}
                    >
                      Done editing {standardLabels[f].toLowerCase()}
                    </button>
                  </>
                ) : (
                  <button
                    id={`edit-${f}`}
                    class="text-button"
                    onClick={() => {
                      setEditing(f);
                      requestAnimationFrame(() =>
                        document
                          .getElementById(
                            `ps-${f}${f === 'keeping' || f === 'violations' ? '-0' : ''}`,
                          )
                          ?.focus(),
                      );
                    }}
                  >
                    Edit {standardLabels[f].toLowerCase()}
                  </button>
                )}
              </div>
            )}
          />
          <div class="planned-note">
            <strong>Status after confirmation: Set</strong>
            <p>
              You are choosing this as your standard. Setting it does not prove you have lived it.
              You can edit it afterward; saved changes always require an explicit save.
            </p>
          </div>
          <div class="actions">
            <button class="button" onClick={() => go('correction')}>
              Back
            </button>
            <button
              class="button primary"
              onClick={() => {
                if (validate() && validStandard(s)) go('record');
              }}
            >
              Set this standard
            </button>
          </div>
        </>
      )}
      {step === 'record' && (
        <>
          <PersonalStandard standard={s} />
          <section class="artifact-actions no-print" aria-label="Use your Personal Standard">
            <p class="take-away">This standard is yours to keep. You can leave here.</p>
            <div class="actions">
              <button class="button primary" onClick={copy}>
                Copy standard
              </button>
              <button class="button" onClick={() => window.print()}>
                Print standard
              </button>
              <button class="button" onClick={() => setDialog('save')}>
                {session.savedKey ? 'Save changes on this device' : 'Save on this device'}
              </button>
              <button class="text-button" onClick={() => go('review')}>
                Edit standard
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
                <label for="standard-copy">Personal Standard plain text</label>
                <textarea
                  id="standard-copy"
                  ref={copyArea}
                  readOnly
                  value={standardText(s)}
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
          <SourceNote items={['period', 'rebuild']} />
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
          confirm={session.savedKey ? 'Save these changes' : 'Save this standard'}
          onCancel={() => setDialog(null)}
          onConfirm={save}
        >
          <LocalNotice artifact="Personal Standard" />
        </ConfirmDialog>
      )}
      {dialog === 'clear' && (
        <ConfirmDialog
          title="Clear current work?"
          confirm="Clear current work"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setSession(newStandardSession());
            setDialog(null);
          }}
        >
          <p>
            This clears the current Build a Standard session. Saved records and work in other tools
            stay until you delete them.
          </p>
        </ConfirmDialog>
      )}
      {removing && (
        <ConfirmDialog
          title="Remove this behavior?"
          confirm="Remove behavior"
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            const { field: f, index } = removing;
            edit(
              f,
              s[f].filter((_, i) => i !== index),
            );
            setRemoving(null);
            setStatus('Behavior removed. The remaining wording is unchanged.');
            requestAnimationFrame(() => document.getElementById(`add-${f}`)?.focus());
          }}
        >
          <p class="answer">{s[removing.field][removing.index]}</p>
          <p>
            This removes the behavior from current work. Saved wording changes only when you
            explicitly save.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
