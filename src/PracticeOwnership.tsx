import { useState } from 'preact/hooks';
import type { Dispatch, StateUpdater } from 'preact/hooks';
import { PeriodBook, PeriodSequence } from './PeriodLearning';
import { purposeOwnershipHandoff } from './period-purpose-content';
import {
  practiceViews,
  practiceCopy as copy,
  communicationConditions,
  evidenceRecords,
  honestMessage,
  helpMessage,
  type PracticeSession,
  type PracticeView,
} from './period-practice-content';

// Only fictional state enters this component. The shell owns the optional card handoff.
export function PracticeOwnership({
  view,
  session,
  setSession,
  openCard,
}: {
  view: PracticeView;
  session: PracticeSession;
  setSession: Dispatch<StateUpdater<PracticeSession>>;
  openCard: () => void;
}) {
  const condition = communicationConditions[session.communication];
  const record = evidenceRecords[session.evidence];
  const [announcement, setAnnouncement] = useState('');
  const conditionContext = (
    <p class="practice-context">
      {condition.context} <a href="#/period/practice">Change the situation</a>
    </p>
  );
  return (
    <div class="period-learning practice">
      <div class="practice-layout">
        <header class="practice-heading">
          <h1 tabIndex={-1}>{view.title}</h1>
          <p class="lead">{view.lead}</p>
          <nav class="practice-nav" aria-label="Practice Ownership views">
            {practiceViews.map((item) => (
              <a
                key={item.id}
                href={`#${item.path}`}
                aria-current={view.id === item.id ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>
        <PeriodSequence active focusOnly />
        <article class="practice-body" aria-label={view.label}>
          <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>
          {view.id === 'situation' && (
            <>
              <h2>{copy.situationHeading}</h2>
              <p>{condition.situation}</p>
              <div
                class="practice-controls"
                role="group"
                aria-labelledby="practice-condition-label"
              >
                <p id="practice-condition-label">{copy.conditionLabel}</p>
                <div class="actions">
                  {Object.entries(communicationConditions).map(([id, item]) => (
                    <button
                      key={id}
                      class={`button ${session.communication === id ? 'primary' : ''}`}
                      aria-pressed={session.communication === id}
                      onClick={() => {
                        const communication = id as PracticeSession['communication'];
                        setSession((old) => ({ ...old, communication }));
                        setAnnouncement(`Fictional situation changed. ${item.context}`);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <p class="practice-context">{condition.context}</p>
              <p class="small">{copy.fictional}</p>
              <p>{copy.limit}</p>
              <div class="practice-boundaries">
                <section>
                  <h3>Outside your control</h3>
                  <p>{condition.outside}</p>
                </section>
                <section>
                  <h3>Yours to choose now</h3>
                  <p>{condition.own}</p>
                </section>
              </div>
              <p class="practice-reflection">{copy.reflection}</p>
              <p>{copy.situationClose}</p>
              <div class="actions">
                <a class="button primary" href="#/period/practice/responses">
                  Compare responses
                </a>
                <a href="#/period/values/ownership">Return to Ownership</a>
              </div>
            </>
          )}
          {view.id === 'responses' && (
            <>
              {conditionContext}
              <p class="practice-reflection">{copy.responsePause}</p>
              <p class="small">{copy.assumptions}</p>
              <div class="practice-responses">
                {[copy.waiting, copy.overpromising].map((item) => (
                  <details key={item.title}>
                    <summary>{item.title}</summary>
                    <blockquote>{item.message}</blockquote>
                    <p class="practice-rationale">{item.explanation}</p>
                  </details>
                ))}
                <details open class="practice-honest">
                  <summary>{copy.honestTitle}</summary>
                  <blockquote>{honestMessage(session.communication)}</blockquote>
                  <p class="practice-rationale">{condition.explanation}</p>
                  <p>{copy.honestLimit}</p>
                </details>
                <details>
                  <summary>{copy.help.title}</summary>
                  <blockquote>{helpMessage(session.communication)}</blockquote>
                  <p class="practice-rationale">{copy.help.explanation}</p>
                </details>
              </div>
              <p class="practice-close">{copy.responseClose}</p>
              <div class="actions">
                <a class="button primary" href="#/period/practice/follow-through">
                  Inspect the follow-through
                </a>
                <a href="#/period/practice">Return to the situation</a>
              </div>
            </>
          )}
          {view.id === 'follow-through' && (
            <>
              {conditionContext}
              <p>{copy.workedExample}</p>
              <p class="small">{copy.assumptions}</p>
              <ol
                class="practice-timeline"
                aria-label="Planned actions and what they could establish"
              >
                {copy.timeline.map((item) => (
                  <li key={item.when}>
                    <h2>{item.when}</h2>
                    <div>
                      <p>{item.action}</p>
                      <p class="small">
                        <strong>If carried out: </strong>
                        {item.evidence}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <div class="practice-controls" role="group" aria-labelledby="practice-evidence-label">
                <p id="practice-evidence-label">{copy.evidenceLabel}</p>
                <div class="actions">
                  {Object.entries(evidenceRecords).map(([id, item]) => (
                    <button
                      key={id}
                      class={`button ${session.evidence === id ? 'primary' : ''}`}
                      aria-pressed={session.evidence === id}
                      onClick={() => {
                        setSession((old) => ({
                          ...old,
                          evidence: id as PracticeSession['evidence'],
                        }));
                        setAnnouncement(`Fictional record shown: ${item.label}.`);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <p class="practice-context">{copy.evidenceContext}</p>
              <section class="practice-evidence" aria-labelledby="practice-record-title">
                <h2 id="practice-record-title">{record.label}</h2>
                <p>{record.record}</p>
                <p>{record.interpretation}</p>
                {session.evidence === 'missed' && <p>{copy.repair}</p>}
              </section>
              <p class="practice-reflection">{copy.evidenceReflection}</p>
              <details class="practice-household">
                <summary>{copy.household.title}</summary>
                <p>{copy.household.situation}</p>
                <details>
                  <summary>{copy.household.disclosure}</summary>
                  <blockquote>{copy.household.response}</blockquote>
                  <p>{copy.household.explanation}</p>
                  <p>{copy.household.agreement}</p>
                </details>
              </details>
              <p class="practice-close">{copy.evidenceClose}</p>
              <div class="actions">
                <a class="button primary" href="#/period/practice/connected-code">
                  See how the values connect
                </a>
                <a href="#/period/practice/responses">Compare responses again</a>
              </div>
            </>
          )}
          {view.id === 'connected-code' && (
            <>
              <p>{copy.connectedOpening}</p>
              <p class="practice-standard">{copy.connectedStandard}</p>
              <ol
                class="practice-connections"
                role="list"
                aria-label="How the six values support one another"
              >
                {copy.relationships.map((item, index) => (
                  <li key={item.value}>
                    <span class="num" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2>{item.value}</h2>
                    <div>
                      <p>{item.contribution}</p>
                      <p>{item.connection}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p>{copy.connectedReturn}</p>
              <p>{copy.empowermentLimit}</p>
              <p class="small">{copy.availability}</p>
              <section class="practice-take-action">
                <h2>{copy.takeActionHeading}</h2>
                <p>{copy.takeAction}</p>
                <p>{purposeOwnershipHandoff}</p>
                <div class="actions">
                  <a class="button primary" href="#/period/values/purpose">
                    Continue to Purpose
                  </a>
                  <a href="#/period/values/ownership">Return to Ownership</a>
                </div>
              </section>
              <section class="practice-optional">
                <h2>A reminder is optional</h2>
                <a
                  href="#/period/standard"
                  onClick={(event) => {
                    if (
                      event.button === 0 &&
                      !event.metaKey &&
                      !event.ctrlKey &&
                      !event.shiftKey &&
                      !event.altKey
                    )
                      openCard();
                  }}
                >
                  {copy.cardLabel}
                </a>
                <p class="small">{copy.cardNote}</p>
              </section>
            </>
          )}
        </article>
      </div>
      {view.id === 'connected-code' && <PeriodBook />}
    </div>
  );
}
