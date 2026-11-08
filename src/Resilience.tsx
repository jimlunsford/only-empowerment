import { Fragment } from 'preact';
import { LessonTransition } from './LessonTransition';
import { LessonTitle } from './LessonTitle';
import { LessonParagraphs } from './LessonParagraphs';
import { useErrorBoundary, useState } from 'preact/hooks';
import { PeriodSequence } from './PeriodLearning';
import { periodBook } from './period-content';
import { integrityContent } from './period-integrity-content';
import { resilienceContent as content } from './period-resilience-content';
import {
  pressureNote,
  resilienceUi as ui,
  type PressureId,
  type PressureNote,
} from './period-resilience-state';

const copy = content.activity;

function ResilienceNavigation({ pressure = false }: { pressure?: boolean }) {
  return (
    <div class="resilience-navigation">
      <nav class="resilience-nav" aria-label="Resilience learning">
        <a href="#/period/values/resilience" aria-current={!pressure ? 'page' : undefined}>
          Read Resilience
        </a>
        <a href="#/period/resilience/pressure" aria-current={pressure ? 'page' : undefined}>
          Explore a plan under pressure
        </a>
      </nav>
      <a
        class="resilience-text-link"
        href={`/read/resilience.html${pressure ? '#pressure-notes' : ''}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read the text-only version <span class="small">(new tab)</span>
      </a>
    </div>
  );
}

export function ResilienceLesson({ openCard }: { openCard: () => void }) {
  return (
    <div class="period-learning resilience-layout value-lesson">
      <header class="resilience-heading lesson-heading">
        <p class="position">3 of 6 in the teaching order</p>
        <h1 tabIndex={-1}>
          <LessonTitle text={content.title} />
        </h1>
        <p class="lead">{content.lead}</p>
      </header>
      <PeriodSequence active="resilience" lesson />
      <div class="lesson-local">
        <ResilienceNavigation />
      </div>
      <article class="resilience-lesson lesson-copy" aria-label="Resilience lesson">
        {content.lesson
          .filter((section) => section.id !== 'L10')
          .map((section) => (
            <Fragment key={section.id}>
              {section.id === 'L12' && <LessonTransition value="resilience" />}
              <section
                key={section.id}
                id={`resilience-${section.id}`}
                class={
                  section.id === 'L02'
                    ? 'resilience-standard'
                    : section.id === 'L05'
                      ? 'resilience-support'
                      : undefined
                }
              >
                <h2>{section.heading}</h2>
                <LessonParagraphs
                  texts={section.paragraphs}
                  treatment={section.id === 'L02' ? 'resilience-standard' : undefined}
                />
                {section.id === 'L08' && (
                  <div class="resilience-invitation">
                    <a class="button primary" href="#/period/resilience/pressure">
                      {section.cta}
                    </a>
                    <p class="small">{section.hint}</p>
                  </div>
                )}
                {section.id === 'L09' && (
                  <ol
                    class="resilience-connections"
                    role="list"
                    aria-label="The connected six values"
                  >
                    {content.values.map(([name, text]) => (
                      <li key={name}>
                        <h3>{name}</h3>
                        <p>{text}</p>
                      </li>
                    ))}
                  </ol>
                )}
                {section.id === 'L11' && (
                  <a
                    class="resilience-card-link"
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
                    {section.cta}
                  </a>
                )}
                {section.id === 'L12' && (
                  <a href={periodBook.url} rel="noreferrer">
                    {section.cta}
                  </a>
                )}
              </section>
            </Fragment>
          ))}
      </article>
    </div>
  );
}

function CaseSetup() {
  return (
    <section class="resilience-setup" aria-labelledby="resilience-setup-heading">
      <h2 id="resilience-setup-heading">{ui.setupHeading}</h2>
      <p>{copy.setup}</p>
      <div class="resilience-anchors">
        <div>
          <h3>The direction</h3>
          <p>{copy.aim}</p>
        </div>
        <div>
          <h3>The standard</h3>
          <p>{copy.standard}</p>
        </div>
      </div>
    </section>
  );
}

function ActualReturn({ expanded = false }: { expanded?: boolean }) {
  return (
    <section class="resilience-return">
      <h3>{copy.returnTitle}</h3>
      <p>{copy.returnCopy}</p>
      {expanded ? (
        <>
          <h4>{ui.returnLabel}</h4>
          <p>{copy.returnStory}</p>
        </>
      ) : (
        <details>
          <summary>{ui.returnLabel}</summary>
          <p>{copy.returnStory}</p>
        </details>
      )}
    </section>
  );
}

// Reused by both the active case and complete reading alternative. No private draft props.
function CaseBody({ note, expanded = false }: { note: PressureNote; expanded?: boolean }) {
  return (
    <>
      <p>{note.facts}</p>
      {!expanded && <p class="resilience-reflection">{copy.reflection}</p>}
      <div class="resilience-methods">
        <section>
          <p class="resilience-method-label">The current method</p>
          <h3>{ui.currentHeading}</h3>
          <p>{note.method}</p>
        </section>
        <section class="resilience-revision">
          <p class="resilience-method-label">One possible revision</p>
          <h3>{ui.revisionHeading}</h3>
          <p>{note.revision}</p>
        </section>
      </div>
      <div class="resilience-consequences">
        <section>
          <h3>{ui.retainHeading}</h3>
          <p>{note.retain}</p>
        </section>
        <section>
          <h3>{ui.costHeading}</h3>
          <p>{note.cost}</p>
        </section>
        <section>
          <h3>{ui.reviewHeading}</h3>
          <p>{note.review}</p>
        </section>
      </div>
      <div class="resilience-responses">
        {note.responses.map((response, index) =>
          expanded ? (
            <section key={response.title}>
              <h3>{response.title}</h3>
              <p>{response.text}</p>
            </section>
          ) : (
            <details key={response.title} open={index === 0}>
              <summary>{response.title}</summary>
              <p>{response.text}</p>
            </details>
          ),
        )}
      </div>
      {note.id === 'missed' && <ActualReturn expanded={expanded} />}
    </>
  );
}

function AllPressureNotes() {
  return (
    <div class="resilience-all-notes">
      <h2>{ui.readingHeading}</h2>
      <p>{ui.readingIntro}</p>
      {content.states.map((note) => (
        <section
          class="resilience-reading-note"
          key={note.id}
          aria-label={`Full pressure note: ${note.name}`}
        >
          <h2>{note.name}</h2>
          <CaseBody note={note} expanded />
        </section>
      ))}
    </div>
  );
}

function PressureWorkspace() {
  const [selected, setSelected] = useState<PressureId>('slow');
  const [announcement, setAnnouncement] = useState('');
  const note = pressureNote(selected);
  return (
    <>
      <div class="resilience-control">
        <label htmlFor="resilience-pressure">{copy.selectorLabel}</label>
        <select
          id="resilience-pressure"
          value={note.id}
          aria-describedby="resilience-pressure-help"
          onChange={(event) => {
            const next = pressureNote(event.currentTarget.value);
            // Restore unknown values too, without announcing an unchanged fictional condition.
            event.currentTarget.value = next.id;
            if (next.id === selected) return;
            setSelected(next.id);
            setAnnouncement(`Pressure note updated: ${next.name}.`);
          }}
        >
          {content.states.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <p class="small" id="resilience-pressure-help">
          {ui.selectorHelp}
        </p>
      </div>
      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <section
        class="resilience-current"
        aria-labelledby="resilience-current-heading"
        key={note.id}
      >
        <h2 id="resilience-current-heading">{note.name}</h2>
        <CaseBody note={note} />
      </section>
    </>
  );
}

export function ResiliencePressure() {
  const [error] = useErrorBoundary();
  return (
    <div class="period-learning resilience-layout resilience-pressure-layout">
      <header class="resilience-heading">
        <h1 tabIndex={-1}>{copy.title}</h1>
        <p class="lead">{copy.lead}</p>
        <p>{copy.intro}</p>
      </header>
      <PeriodSequence active="resilience" focusOnly />
      <ResilienceNavigation pressure />
      <article class="resilience-pressure" aria-label="Alex's fictional pressure case">
        <CaseSetup />
        {error ? <p>{ui.unavailable}</p> : <PressureWorkspace />}
        <section class="resilience-shared" aria-label="Understanding the comparison">
          <p>{copy.shared}</p>
          <p>{ui.refinement}</p>
        </section>
        {error ? (
          <AllPressureNotes />
        ) : (
          <details class="resilience-reading">
            <summary>{ui.readingLabel}</summary>
            <AllPressureNotes />
          </details>
        )}
        <p class="resilience-closing">{copy.closing}</p>
        <section class="resilience-close">
          <h2>{ui.closeHeading}</h2>
          <p>{ui.close}</p>
          <a href="#/period/values/resilience">Return to Resilience</a>
          <p class="small">{integrityContent.navigation.resilience_bridge}</p>
          <a href="#/period/values/integrity">Continue to Integrity</a>
        </section>
      </article>
    </div>
  );
}
