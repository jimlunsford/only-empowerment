import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { TextResponse, ConfirmDialog, LocalNotice } from './components/work';
import { SourceNote } from './components/shared';
import { renderStandardText } from './components/artifact-text';
import {
  rebuildFields,
  rebuildLabels,
  rebuildSteps,
  rebuildStepFields,
  rebuildErrors,
  rebuildTextError,
  rebuildText,
  validRebuild,
  newRebuildSession,
  prepareRebuildHandoff,
  REBUILD_LIMIT,
  ACTION_LIMIT,
  ACTION_MAX,
  type Rebuild,
  type RebuildField,
  type RebuildStep,
  type RebuildStage,
  type RebuildSession,
  type RebuildHandoff,
} from './rebuild-model';
import { rebuildLessons } from './rebuild-lessons';
import { standardLabels } from './standard-model';
import { browserStorage, CardStorageError } from './local-cards';
import { parseStandard, type StandardEntry } from './local-standards';
import { saveRebuild } from './local-rebuilds';
import { newSession } from './next-move-model';
import { broadcast, type LocalWork } from './use-local-work';

export function RebuildArtifact({
  map,
  review = false,
  editor,
}: {
  map: Rebuild;
  review?: boolean;
  editor?: (field: RebuildField) => ComponentChildren;
}) {
  return (
    <article
      class="output-card execution-card personal-standard rebuild-map"
      aria-labelledby="rebuild-title"
    >
      <div class="artifact-header">
        <p class="eyebrow">Only Empowerment · Rebuild Map</p>
        {!review && <span class="planned-badge">Status: Mapped</span>}
      </div>
      <h2 id="rebuild-title" tabIndex={-1}>
        Rebuild Map{review ? ' review' : ''}
      </h2>
      {rebuildFields.map((f) => (
        <section class={`artifact-section rebuild-${f}`} key={f}>
          <h3>{rebuildLabels[f]}</h3>
          {f === 'actions' ? (
            <ul class="standard-behaviors">
              {map.actions.map((v, i) => (
                <li key={i} class="answer">
                  {renderStandardText(v)}
                </li>
              ))}
            </ul>
          ) : (
            <p class="answer">{renderStandardText(map[f])}</p>
          )}
          {editor?.(f)}
        </section>
      ))}
      {!review && (
        <>
          <p class="artifact-footnote">
            Mapped means the rebuild system has been mapped. It does not mean the rebuild happened,
            proof was created, or identity changed.
          </p>
          <p class="print-only">
            Built by Jim Lunsford · jimlunsford.com
            <br />
            Based on How to Rebuild Yourself · jimlunsford.com/how-to-rebuild-yourself/
          </p>
        </>
      )}
    </article>
  );
}
export function RebuildMap({ work }: { work: LocalWork }) {
  const { rebuildSession: session, setRebuildSession: setSession } = work;
  const { map, step } = session;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<RebuildField | null>(null);
  const [dialog, setDialog] = useState<'save' | 'clear' | 'replace' | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [handoff, setHandoff] = useState<RebuildHandoff | null>(null);
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
    if (session.step === 'handoff') go('record');
  }, []);
  useEffect(() => {
    if (fallback) {
      copyArea.current?.focus();
      copyArea.current?.select();
    }
  }, [fallback]);
  useEffect(() => {
    if (step === 'context' && !map.area) {
      setDialog(null);
      setRemoving(null);
      setFallback(false);
      setHandoff(null);
      setStatus('');
      setEditing(null);
    }
  }, [map, step]);
  function go(next: RebuildStep) {
    setSession((old) => ({ ...old, step: next }));
  }
  function focusField(f: RebuildField) {
    requestAnimationFrame(() =>
      document.getElementById(`rm-${f}${f === 'actions' ? '-0' : ''}`)?.focus(),
    );
  }
  function edit(f: RebuildField, value: string | string[]) {
    setSession((old) => ({ ...old, map: { ...old.map, [f]: value } }));
    setErrors((old) =>
      Object.fromEntries(Object.entries(old).filter(([k]) => k !== f && !k.startsWith(f + '-'))),
    );
  }
  function validate(fields = rebuildFields) {
    const next = rebuildErrors(map, fields);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      if (step === 'review')
        setEditing(rebuildFields.find((f) => first === f || first.startsWith(f + '-'))!);
      requestAnimationFrame(() => document.getElementById('rm-' + first)?.focus());
    }
    return !first;
  }
  function chooseSource(source: RebuildSession['source']) {
    setSession((old) => ({
      ...old,
      source,
      reference: null,
      selectedKey: null,
      map: { ...old.map, standard: '' },
    }));
    setErrors({});
  }
  function selectStandard(key: string) {
    try {
      const record = parseStandard(browserStorage().getItem(key), key);
      if (!record) throw new Error('unavailable');
      setSession((old) => ({
        ...old,
        selectedKey: key,
        reference: structuredClone(record.standard),
        map: { ...old.map, standard: record.standard.standard },
      }));
      setErrors({});
      setStatus('Reference selected. Your other Rebuild Map answers are unchanged.');
    } catch {
      work.refresh();
      setStatus(
        'That saved standard could not be read. Choose an available standard or state the line yourself.',
      );
    }
  }
  function field(f: RebuildField, label?: string) {
    if (f !== 'actions')
      return (
        <TextResponse
          id={`rm-${f}`}
          label={label || rebuildLabels[f]}
          value={map[f]}
          limit={REBUILD_LIMIT}
          error={errors[f]}
          onChange={(v) => edit(f, v)}
        />
      );
    return (
      <fieldset class="standard-list-editor">
        <legend>What actions will you repeat?</legend>
        <p class="field-hint">One to five actions. Up to 1,000 characters each.</p>
        {map.actions.map((v, i) => (
          <section class="standard-list-item" key={i}>
            <TextResponse
              id={`rm-actions-${i}`}
              label={`Repeated action ${i + 1}`}
              value={v}
              limit={ACTION_LIMIT}
              rows={3}
              error={errors[`actions-${i}`]}
              onChange={(value) =>
                edit(
                  'actions',
                  map.actions.map((old, j) => (j === i ? value : old)),
                )
              }
            />
            {map.actions.length > 1 && (
              <button class="text-button" type="button" onClick={() => setRemoving(i)}>
                Remove action {i + 1}
              </button>
            )}
          </section>
        ))}
        <button
          id="rm-add-action"
          class="button"
          type="button"
          disabled={map.actions.length >= ACTION_MAX}
          onClick={() => {
            const index = map.actions.length;
            edit('actions', [...map.actions, '']);
            setStatus('Action added.');
            requestAnimationFrame(() => document.getElementById(`rm-actions-${index}`)?.focus());
          }}
        >
          Add repeated action
        </button>
        {map.actions.length === ACTION_MAX && (
          <p class="small">Five actions added. Edit or remove an item to make room.</p>
        )}
        {errors.actions && (
          <p class="error" role="alert">
            {errors.actions}
          </p>
        )}
      </fieldset>
    );
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(rebuildText(map));
      setStatus('Rebuild Map copied.');
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
      const entry = saveRebuild(
        browserStorage(),
        map,
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
          ? 'Not saved. This record changed or was deleted. Copy your words before reopening it from Saved work.'
          : code === 'full'
            ? 'Not saved. Up to 50 saved Only Empowerment records total. Delete an unneeded record or copy this Rebuild Map.'
            : 'Save could not be verified. Browser storage may be blocked or full. Your map remains here to copy or print. Check Saved work before retrying.',
      );
      work.refresh();
    }
  }
  function handoffValid() {
    if (!handoff) return false;
    const next: Record<string, string> = {};
    for (const f of ['situation', 'action'] as const) {
      if (handoff[f === 'situation' ? 'includeSituation' : 'includeAction']) {
        const error = rebuildTextError(handoff[f]);
        if (error) next[`handoff-${f}`] = error;
      }
    }
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) requestAnimationFrame(() => document.getElementById('rm-' + first)?.focus());
    return !first;
  }
  function transfer() {
    if (!handoff || !handoffValid()) return;
    work.setSession({
      ...newSession(),
      fromRebuild: true,
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
  const lesson = step in rebuildLessons ? rebuildLessons[step as RebuildStage] : null;
  const isSaved =
    session.savedRaw && JSON.stringify(JSON.parse(session.savedRaw).map) === JSON.stringify(map);
  return (
    <div class="rebuild work-width">
      <header class="work-header no-print">
        <div>
          <p class="eyebrow">Rebuild Map</p>
          <h1 ref={heading} tabIndex={-1}>
            {lesson?.heading ||
              (step === 'pause'
                ? 'Establish the standard first.'
                : step === 'review'
                  ? 'Review the system you will build.'
                  : step === 'handoff'
                    ? 'Choose what to take into Next Move.'
                    : 'The map is set. Start the first move.')}
          </h1>
        </div>
        <p class="work-orientation">
          {lesson
            ? `Step ${rebuildSteps.indexOf(step as RebuildStage) + 1} of 7`
            : 'Your words. Your choice.'}
        </p>
      </header>
      {step === 'context' && (
        <div class="decision-entry">
          <p>
            Turn one area that needs rebuilding into a system: a standard, supporting structure,
            repeated actions, and evidence you can recognize. You author the rebuild.
          </p>
          <p class="small">
            If the direction itself is undecided, <a href="#/tools/decision-room">Decision Room</a>{' '}
            can help you choose. If you are correcting a specific miss,{' '}
            <a href="#/tools/reset">Reset</a> has that job.
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
                <summary>Facts and identity</summary>
                <p>{lesson.example}</p>
              </details>
            )}
            {step !== 'context' && step !== 'standard' && (
              <details class="comparison-context">
                <summary>Your standard and structure</summary>
                <h3>Standard</h3>
                <p class="answer">{renderStandardText(map.standard)}</p>
                {map.structure && (
                  <>
                    <h3>Structure</h3>
                    <p class="answer">{renderStandardText(map.structure)}</p>
                  </>
                )}
                <button type="button" class="text-button" onClick={() => go('standard')}>
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
                  document.getElementById('rm-source-manual')?.focus();
                  return;
                }
                if (session.source === 'saved' && !session.reference) {
                  setErrors({
                    source:
                      'Select a saved Personal Standard explicitly, or state the standard yourself.',
                  });
                  document.getElementById('rm-saved-standard')?.focus();
                  return;
                }
              }
              if (validate(rebuildStepFields[step as RebuildStage]))
                go(
                  step === 'firstMove'
                    ? 'review'
                    : rebuildSteps[rebuildSteps.indexOf(step as RebuildStage) + 1],
                );
            }}
          >
            {step === 'context' && (
              <>
                {field('area', lesson.question)}
                {field('reality', 'What is true right now?')}
              </>
            )}
            {step === 'standard' && (
              <>
                <fieldset
                  class="reset-choices"
                  aria-describedby={errors.source ? 'rm-source-error' : undefined}
                >
                  <legend>What standard are you rebuilding toward?</legend>
                  {(
                    [
                      ['manual', 'State the standard myself'],
                      ['saved', 'Use a saved Personal Standard'],
                      ['unclear', 'I do not have a clear standard yet'],
                    ] as const
                  ).map(([value, label]) => (
                    <label class="reset-choice" key={value}>
                      <input
                        id={`rm-source-${value}`}
                        type="radio"
                        name="rebuild-standard-source"
                        checked={session.source === value}
                        onChange={() => chooseSource(value)}
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
                {errors.source && (
                  <p id="rm-source-error" class="error" role="alert">
                    {errors.source}
                  </p>
                )}
                {session.source === 'saved' && (
                  <div class="standard-selection">
                    <label for="rm-saved-standard">Choose a saved Personal Standard</label>
                    <select
                      id="rm-saved-standard"
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
                    {session.reference && (
                      <details
                        class="reset-reference"
                        aria-label="Selected Personal Standard reference"
                      >
                        <summary>View selected standard reference</summary>
                        <p class="small">
                          Read-only reference. Only the standard statement goes into your separate
                          Rebuild Map.
                        </p>
                        {(['area', 'standard', 'keeping', 'structure'] as const).map((f) => (
                          <div key={f}>
                            <h3>{standardLabels[f]}</h3>
                            {f === 'keeping' ? (
                              <ul>
                                {session.reference!.keeping.map((v, i) => (
                                  <li class="answer" key={i}>
                                    {renderStandardText(v)}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p class="answer">{renderStandardText(session.reference![f])}</p>
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
                    {field('standard', 'Standard statement for this map')}
                    <p class="small">
                      Editing this map never changes the saved Personal Standard it came from.
                    </p>
                    <p class="small">
                      Need to define keeping behaviors, violations, adaptation, or correction in
                      full? <a href="#/tools/build-a-standard">Open Build a Standard</a>. Your map
                      stays in memory in this tab.
                    </p>
                  </>
                )}
              </>
            )}
            {(step === 'structure' || step === 'proof' || step === 'firstMove') &&
              field(step, lesson.question)}
            {step === 'actions' && field('actions')}
            {step === 'trust' && (
              <>
                {field('trust', lesson.question)}
                {field(
                  'negotiation',
                  'What do you want to stop renegotiating every time pressure shows up?',
                )}
              </>
            )}
            <div class="actions workflow-actions">
              {step !== 'context' && (
                <button
                  type="button"
                  class="button"
                  onClick={() => go(rebuildSteps[rebuildSteps.indexOf(step as RebuildStage) - 1])}
                >
                  Back
                </button>
              )}
              <button type="submit" class="button primary">
                {step === 'firstMove' ? 'Review my Rebuild Map' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      )}
      {step === 'pause' && (
        <section class="pause-panel">
          <h2>Choose a clear line before mapping the rebuild.</h2>
          <p>Build a Standard can help you define that line. No Rebuild Map has been created.</p>
          <p>
            Your work stays in memory during navigation within this tab. Reloading or closing the
            tab can discard unsaved work. Return here to state the standard or explicitly select one
            you saved.
          </p>
          <div class="actions">
            <a class="button primary" href="#/tools/build-a-standard">
              Open Build a Standard
            </a>
            <button class="button" onClick={() => go('standard')}>
              Return to the standard
            </button>
          </div>
        </section>
      )}
      {step === 'review' && (
        <>
          <p class="review-intro">
            Read the map as a system you can put into practice. Does the structure support the
            standard? Will the repeated actions create the proof you named? Edit any section.
            Editing this map never changes the saved Personal Standard it came from.
          </p>
          <RebuildArtifact
            map={map}
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
                            document.getElementById(`rm-edit-${f}`)?.focus(),
                          );
                        }
                      }}
                    >
                      Done editing {rebuildLabels[f].toLowerCase()}
                    </button>
                  </>
                ) : (
                  <button
                    id={`rm-edit-${f}`}
                    class="text-button"
                    onClick={() => {
                      setEditing(f);
                      focusField(f);
                    }}
                  >
                    Edit {rebuildLabels[f].toLowerCase()}
                  </button>
                )}
              </div>
            )}
          />
          <div class="planned-note">
            <strong>Status after confirmation: Mapped</strong>
            <p>
              A system has been mapped. The behavior and proof are still ahead. Saved changes always
              require another explicit save.
            </p>
          </div>
          <div class="actions">
            <button class="button" onClick={() => go('firstMove')}>
              Back
            </button>
            <button
              class="button primary"
              onClick={() => {
                if (validate() && validRebuild(map)) go('record');
              }}
            >
              Confirm Rebuild Map
            </button>
          </div>
        </>
      )}
      {step === 'record' && (
        <>
          <RebuildArtifact map={map} />
          <section class="artifact-actions no-print" aria-label="Use your Rebuild Map">
            <p>
              Start the first move and begin creating proof. You can leave with this map and act.
            </p>
            <p class="save-state">
              {isSaved ? 'Saved on this device.' : 'Not saved. Your map is in memory in this tab.'}
            </p>
            <div class="actions">
              <button class="button primary" onClick={copy}>
                Copy Rebuild Map
              </button>
              <button class="button" onClick={() => window.print()}>
                Print / save PDF
              </button>
              <button class="button" onClick={() => setDialog('save')}>
                {session.savedKey ? 'Save changes on this device' : 'Save on this device'}
              </button>
              <button class="button" onClick={() => go('review')}>
                Edit map
              </button>
            </div>
            <p class="small">Clipboard sync, printouts, and PDFs are outside local deletion.</p>
            {fallback && (
              <div class="copy-fallback">
                <label for="rm-copy">Rebuild Map plain text</label>
                <textarea id="rm-copy" ref={copyArea} readOnly value={rebuildText(map)} rows={12} />
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
                Next Move can help make the first move executable. The map is already yours to use;
                continuing is optional.
              </p>
              <button
                class="button"
                onClick={() => {
                  setHandoff(prepareRebuildHandoff(map));
                  go('handoff');
                }}
              >
                Turn the first move into a Next Move
              </button>
            </section>
          </section>
        </>
      )}
      {step === 'handoff' && handoff && (
        <section class="review-panel">
          <p>
            Only the fields you include stay inside this tab and move into Next Move. Your Rebuild
            Map stays here. Nothing is saved automatically or sent. Next Move still runs its full
            workflow: readiness, obstacle, start condition, completion boundary, and review.
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
                    Include{' '}
                    {f === 'situation'
                      ? 'area and current reality as situation'
                      : 'first move as action'}
                  </span>
                </label>
                {handoff[include] && (
                  <TextResponse
                    id={`rm-handoff-${f}`}
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
          <SourceNote items={['rebuild', 'period', 'loop', 'execution']} />
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
          confirm={session.savedKey ? 'Save these changes' : 'Save this map'}
          onCancel={() => setDialog(null)}
          onConfirm={save}
        >
          <LocalNotice artifact="Rebuild Map" />
        </ConfirmDialog>
      )}
      {dialog === 'clear' && (
        <ConfirmDialog
          title="Clear current work?"
          confirm="Clear current work"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setSession(newRebuildSession());
            setDialog(null);
          }}
        >
          <p>
            This clears the current Rebuild Map session. Saved records and work in other tools stay
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
            session will be lost. Saved Execution Cards will not be changed.
          </p>
        </ConfirmDialog>
      )}
      {removing !== null && (
        <ConfirmDialog
          title="Remove this repeated action?"
          confirm="Remove action"
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            const index = removing;
            edit(
              'actions',
              map.actions.filter((_, i) => i !== index),
            );
            setRemoving(null);
            setStatus('Action removed.');
            requestAnimationFrame(() =>
              document
                .getElementById(`rm-actions-${Math.min(index, map.actions.length - 2)}`)
                ?.focus(),
            );
          }}
        >
          <p>
            This removes action {removing + 1} from this map. Saved changes require another explicit
            save.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
