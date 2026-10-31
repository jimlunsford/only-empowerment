import { useState } from 'preact/hooks';
import type { Dispatch, StateUpdater } from 'preact/hooks';
import { PeriodSequence } from './PeriodLearning';
import { periodBook } from './period-content';
import {
  purposeLesson,
  purposeRelationships,
  purposeConnected,
  purposeBridge,
  purposeCardNote,
  purposeBook,
  purposeCopy as copy,
  purposeDirections,
  purposeCapacities,
  purposeExamples,
  purposeExample,
  type PurposeDirection,
  type PurposeCapacity,
  type PurposeSession,
  type PurposeExample,
} from './period-purpose-content';

function PurposeNavigation({ evening = false }: { evening?: boolean }) {
  return (
    <nav class="purpose-nav" aria-label="Purpose learning">
      <a href="#/period/values/purpose" aria-current={!evening ? 'page' : undefined}>
        Read Purpose
      </a>
      <a href="#/period/purpose/evening" aria-current={evening ? 'page' : undefined}>
        Explore one evening
      </a>
    </nav>
  );
}

export function PurposeLesson({ openCard }: { openCard: () => void }) {
  return (
    <div class="period-learning purpose-lesson-layout">
      <header class="purpose-lesson-heading">
        <p class="position">2 of 6 in the teaching order</p>
        <h1 tabIndex={-1}>Purpose.</h1>
        <p class="lead">Give responsibility a direction.</p>
      </header>
      <PeriodSequence active="purpose" />
      <PurposeNavigation />
      <article class="purpose-lesson" aria-label="Purpose lesson">
        {purposeLesson.map((section) => (
          <section key={section.id}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {section.id === 'L06' && (
              <div class="purpose-invitation">
                <a class="button primary" href="#/period/purpose/evening">
                  Explore one evening
                </a>
                <p class="small">A fictional comparison. No written answer required.</p>
              </div>
            )}
          </section>
        ))}
        <section>
          <h2>Purpose belongs to the whole Code</h2>
          <p>{purposeConnected}</p>
          <ol
            class="purpose-connections"
            role="list"
            aria-label="Purpose and the connected six values"
          >
            {purposeRelationships.map((item, index) => (
              <li key={item.value}>
                <span class="num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{item.value}</h3>
                <p>{item.connection}</p>
              </li>
            ))}
          </ol>
        </section>
        <section class="purpose-pressure">
          <h2>Direction will meet pressure</h2>
          {purposeBridge.slice(0, 2).map((text) => (
            <p key={text}>{text}</p>
          ))}
          <p class="small">
            <strong>{purposeBridge[2]}</strong>
          </p>
          <a href="#/period/values/ownership">Return to Ownership</a>
        </section>
        <section class="purpose-reminder">
          <h2>A reminder is optional</h2>
          <p>{purposeCardNote}</p>
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
            Write an optional Standard Card
          </a>
        </section>
        <section class="purpose-book no-print">
          <h2>{purposeBook.heading}</h2>
          <p>{purposeBook.description}</p>
          <a href={periodBook.url} rel="noreferrer">
            {purposeBook.label}
          </a>
        </section>
      </article>
    </div>
  );
}

function ExampleReading({ example }: { example: PurposeExample }) {
  return (
    <section class="purpose-reading-example">
      <h3>{example.label}</h3>
      <h4>Direction in this example</h4>
      <p>{purposeDirections[example.direction].description}</p>
      <h4>Capacity tonight</h4>
      <p>{purposeCapacities[example.capacity].description}</p>
      <h4>A possible evening</h4>
      <ol>
        {example.plan.map((item) => (
          <li key={item.time}>
            <p>
              <strong>
                {item.time} · {item.title}
              </strong>
            </p>
            <p>{item.description}</p>
          </li>
        ))}
      </ol>
      <h4>What this serves</h4>
      <p>{example.serves}</p>
      <h4>What waits, and what it costs</h4>
      <p>{example.cost}</p>
      <h4>What this does not establish</h4>
      <p>{example.uncertain}</p>
      <p class="purpose-comparison-cue">{example.compare}</p>
    </section>
  );
}

// Receives only fictional conditions. No Standard Card or private tool draft enters here.
export function PurposeEvening({
  session,
  setSession,
}: {
  session: PurposeSession;
  setSession: Dispatch<StateUpdater<PurposeSession>>;
}) {
  const [announcement, setAnnouncement] = useState('');
  const example = purposeExample(session);
  const changeExample = (next: PurposeSession) => {
    if (next.direction === session.direction && next.capacity === session.capacity) return;
    setSession(next);
    setAnnouncement(
      `Fictional example: ${purposeDirections[next.direction].label}, ${purposeCapacities[next.capacity].label.toLowerCase()}. Plan and tradeoffs updated.`,
    );
  };
  return (
    <div class="period-learning purpose-evening">
      <header class="purpose-evening-heading">
        <p class="small">Purpose · Fictional comparison</p>
        <h1 tabIndex={-1}>{copy.title}</h1>
        <p class="lead">{copy.lead}</p>
        <p>{copy.intro}</p>
      </header>
      <PurposeNavigation evening />
      <div class="purpose-evening-sequence">
        <PeriodSequence active="purpose" focusOnly />
      </div>
      <section class="purpose-situation" aria-labelledby="purpose-situation-heading">
        <h2 id="purpose-situation-heading">{copy.situation_heading}</h2>
        <p>{copy.situation}</p>
        <p>{copy.facts}</p>
        <p class="small">{copy.assumptions}</p>
      </section>
      <div class="purpose-controls">
        <div role="group" aria-labelledby="purpose-direction-label">
          <p id="purpose-direction-label">{copy.direction_label}</p>
          <div class="actions">
            {Object.entries(purposeDirections).map(([id, direction]) => (
              <button
                key={id}
                class={`button ${session.direction === id ? 'primary' : ''}`}
                aria-pressed={session.direction === id}
                onClick={() => changeExample({ ...session, direction: id as PurposeDirection })}
              >
                {direction.label}
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-labelledby="purpose-capacity-label">
          <p id="purpose-capacity-label">{copy.capacity_label}</p>
          <div class="actions">
            {Object.entries(purposeCapacities).map(([id, capacity]) => (
              <button
                key={id}
                class={`button ${session.capacity === id ? 'primary' : ''}`}
                aria-pressed={session.capacity === id}
                onClick={() => changeExample({ ...session, capacity: id as PurposeCapacity })}
              >
                {capacity.label}
              </button>
            ))}
          </div>
        </div>
        <p class="small purpose-capacity-description">
          {purposeCapacities[session.capacity].description}
        </p>
      </div>
      <p class="purpose-reflection">{copy.reflection}</p>
      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <p class="purpose-showing">Showing: {example.label}</p>
      <p class="purpose-plan-distinction">{copy.planDistinction}</p>
      <section class="purpose-current-example" aria-label={`Fictional example: ${example.label}`}>
        <div class="purpose-plan-layout">
          <div>
            <section class="purpose-direction-panel" aria-labelledby="purpose-direction-heading">
              <h2 id="purpose-direction-heading">Direction in this example</h2>
              <p>{purposeDirections[session.direction].description}</p>
            </section>
            <p class="small purpose-direction-limit">{copy.directionLimit}</p>
          </div>
          <section aria-labelledby="purpose-plan-heading">
            <h2 id="purpose-plan-heading">A possible evening</h2>
            <ol class="purpose-timeline" role="list">
              {example.plan.map((item) => (
                <li key={item.time}>
                  <p class="purpose-time">{item.time}</p>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <div class="purpose-consequences">
          <section>
            <h3>What this serves</h3>
            <p>{example.serves}</p>
          </section>
          <section>
            <h3>What waits, and what it costs</h3>
            <p>{example.cost}</p>
          </section>
          <section>
            <h3>What this does not establish</h3>
            <p>{example.uncertain}</p>
          </section>
        </div>
        <p class="purpose-comparison-cue">{example.compare}</p>
      </section>
      <section class="purpose-unchanged">
        <h2>{copy.same_evening_heading}</h2>
        <p>{copy.same_evening}</p>
        <p>{copy.same_evening_end}</p>
      </section>
      <section class="purpose-close">
        <h2>{copy.close_heading}</h2>
        <p>{copy.close}</p>
        <p>{copy.pressure}</p>
        <a href="#/period/values/purpose">Return to Purpose</a>
      </section>
      <details class="purpose-reading">
        <summary>{copy.readingLabel}</summary>
        <h2>All four fictional examples</h2>
        <p>{copy.readingLead}</p>
        {Object.values(purposeExamples).map((item) => (
          <ExampleReading key={item.label} example={item} />
        ))}
      </details>
      <p class="small purpose-reassurance">{copy.reassurance}</p>
    </div>
  );
}
