import { PeriodSequence } from './PeriodLearning';
import { periodBook } from './period-content';
import { integrityContent as content } from './period-integrity-content';

const copy = content.case;

function IntegrityNavigation({ record = false }: { record?: boolean }) {
  return (
    <div class="integrity-navigation">
      <nav class="integrity-nav" aria-label="Integrity learning">
        <a href="#/period/values/integrity" aria-current={!record ? 'page' : undefined}>
          Read Integrity
        </a>
        <a href="#/period/integrity/record" aria-current={record ? 'page' : undefined}>
          Examine a fictional record
        </a>
      </nav>
      <a
        class="integrity-text-link"
        href={`/read/integrity.html${record ? '#record' : ''}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content.navigation.static_link}
      </a>
    </div>
  );
}

export function IntegrityLesson({ openCard }: { openCard: () => void }) {
  return (
    <div class="period-learning integrity-layout">
      <header class="integrity-heading">
        <p class="position">4 of 6 in the teaching order</p>
        <h1 tabIndex={-1}>{content.title}</h1>
        <p class="lead">{content.lead}</p>
      </header>
      <PeriodSequence active="integrity" />
      <IntegrityNavigation />
      <article class="integrity-lesson" aria-label="Integrity lesson">
        {content.lesson.map((section) => (
          <section id={`integrity-${section.id}`} key={section.id}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {section.id === content.activity_invitation.after && (
              <div class="integrity-invitation">
                <a class="button primary" href="#/period/integrity/record">
                  {content.activity_invitation.label}
                </a>
                <p class="small">{content.activity_invitation.hint}</p>
              </div>
            )}
            {section.id === 'L10' && (
              <p class="small">
                <strong>{content.availability}</strong>{' '}
                <a href="#/period/values/discipline">Continue to Discipline</a>
              </p>
            )}
          </section>
        ))}
        <section class="integrity-reminder">
          <h2>A reminder is optional</h2>
          <p>{content.card}</p>
          <div class="actions">
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
            <a href="#/period/values/resilience">Return to Resilience</a>
          </div>
        </section>
        <section>
          <h2>Explore the complete PERIOD Code</h2>
          <p>{content.book}</p>
          <a href={periodBook.url} rel="noreferrer">
            Explore the book on Jim's website
          </a>
        </section>
        <p class="source-note">{content.attribution}</p>
      </article>
    </div>
  );
}

// Fixed editorial evidence only. Native disclosures own their independent transient state.
export function IntegrityRecord() {
  return (
    <div class="period-learning integrity-layout integrity-record-layout">
      <header class="integrity-heading">
        <h1 tabIndex={-1}>{copy.title}</h1>
        <p class="lead">{copy.lead}</p>
        <p>{copy.intro}</p>
      </header>
      <PeriodSequence active="integrity" focusOnly />
      <IntegrityNavigation record />
      <article class="integrity-record" aria-label="Riley and Maya's fictional record">
        <section class="integrity-setup">
          <h2>The situation</h2>
          <p>{copy.setup}</p>
          <div class="integrity-evidence">
            <section class="integrity-message">
              <h3>The message Riley sent</h3>
              <p>{copy.original}</p>
            </section>
            <section class="integrity-facts">
              <h3>The known record</h3>
              <ol>
                {copy.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ol>
            </section>
          </div>
          <p class="integrity-challenge">{copy.challenge}</p>
          <p class="integrity-reflection">{copy.reflection}</p>
        </section>
        <div class="integrity-annotations">
          {copy.notes.map((note) => (
            <details id={`integrity-note-${note.id}`} key={note.id}>
              <summary>
                {note.label}
                <span class="integrity-claim">{note.claim}</span>
              </summary>
              <div class="integrity-note-body">
                <h3>What the record shows</h3>
                <p>{note.fact}</p>
                <h3>Why it matters</h3>
                <p>{note.explanation}</p>
                <h3>
                  {'replacement_label' in note ? note.replacement_label : 'A truthful replacement'}
                </h3>
                <p>{note.replacement}</p>
                <h3>Action beyond wording</h3>
                <p>{note.action}</p>
                <h3>What this cannot settle</h3>
                <p>{note.limit}</p>
              </div>
            </details>
          ))}
        </div>
        <section class="integrity-comparison">
          <h2>What each response leaves in place</h2>
          <p>{copy.comparison_intro}</p>
          {copy.responses.map(([heading, words, result]) => (
            <section key={heading}>
              <h3>{heading}</h3>
              <blockquote>{words}</blockquote>
              <p>{result}</p>
            </section>
          ))}
        </section>
        <section class="integrity-correction">
          <h2>A correction that reaches the same audience</h2>
          <blockquote>{copy.correction}</blockquote>
          <p>{copy.correction_note}</p>
        </section>
        <section class="integrity-continuation">
          <h2>{copy.continuation_title}</h2>
          {copy.continuation.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <p>{copy.evidence}</p>
        </section>
        <section class="integrity-limits">
          <h2>What remains outside Riley's control</h2>
          <p>{copy.limits}</p>
          <p>{copy.closure}</p>
          <p>{copy.bridge}</p>
          <p>
            <a href="#/period/values/discipline">Continue to Discipline</a>
          </p>
          <a href="#/period/values/integrity">Return to Integrity</a>
        </section>
        <p class="source-note">{content.attribution}</p>
      </article>
    </div>
  );
}
