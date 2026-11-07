import { PeriodHomepage } from './PeriodHomepage';
import { LessonTitle } from './LessonTitle';
import {
  periodValues,
  ownershipFoundation as foundation,
  periodBook as book,
  periodExercise,
} from './period-content';
import { periodPresentation as presentation } from './period-presentation';
import { PageIntro } from './components/shared';
import { purposeOwnershipHandoff } from './period-purpose-content';
import { empowermentAvailability } from './period-empowerment-content';
export function PeriodAttribution() {
  return <p class="source-note">{periodExercise.source}</p>;
}
export function PeriodSequence({
  active = false,
  focusOnly = false,
  lesson = false,
  showAvailability = true,
}: {
  active?:
    boolean | 'ownership' | 'purpose' | 'resilience' | 'integrity' | 'discipline' | 'empowerment';
  focusOnly?: boolean;
  lesson?: boolean;
  showAvailability?: boolean;
}) {
  const focus = active === true ? 'ownership' : active;
  return (
    <nav class={`period-sequence ${active ? 'lesson-nav' : ''}`} aria-label="PERIOD teaching order">
      {active && <h2>The six-value path</h2>}
      <ol class="path" role="list">
        {periodValues.map((v, index) => (
          <li key={v.id} class={focus === v.id ? 'selected' : undefined}>
            {lesson ? (
              <a
                class="lesson-value-link"
                aria-labelledby={`lesson-value-name-${v.id}`}
                aria-describedby={`lesson-value-role-${v.id}`}
                href={`#/period/values/${v.id}`}
                aria-current={focus === v.id ? 'page' : undefined}
              >
                <span class="num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span class="path-name" id={`lesson-value-name-${v.id}`}>
                    <LessonTitle text={v.name} />
                  </span>
                  <span class="path-role" id={`lesson-value-role-${v.id}`}>
                    {v.role}
                  </span>
                </span>
              </a>
            ) : (
              <>
                <span class="num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <span class="path-name">
                    {[
                      'ownership',
                      'purpose',
                      'resilience',
                      'integrity',
                      'discipline',
                      'empowerment',
                    ].includes(v.id) ? (
                      <a
                        href={`#/period/values/${v.id}`}
                        aria-current={focus === v.id && !focusOnly ? 'page' : undefined}
                      >
                        {v.name}
                        {focusOnly && focus === v.id && (
                          <span class="sr-only"> (lesson focus)</span>
                        )}
                      </a>
                    ) : (
                      <span>{v.name}</span>
                    )}
                  </span>
                  <p>{v.role}</p>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
      {showAvailability && <p class="path-note">{empowermentAvailability}</p>}
    </nav>
  );
}
export function PeriodIntro() {
  return <PeriodHomepage sequence={<PeriodSequence showAvailability={false} />} />;
}
export function PeriodOwnership() {
  const value = periodValues[0],
    lesson = value.lesson;
  return (
    <div class="period-learning">
      <div class="value-lesson lesson-layout">
        <header class="lesson-title lesson-heading">
          <p class="position">1 of 6 in the teaching order</p>
          <h1 tabIndex={-1}>
            <LessonTitle text="Ownership" />
            <span class="dot" aria-hidden="true">
              .
            </span>
          </h1>
          <p class="lead">{value.role}</p>
        </header>
        <PeriodSequence active lesson />
        <article class="period-lesson lesson-copy" aria-label="Ownership lesson">
          <section>
            <h2>Meaning</h2>
            <p>{lesson.meaning}</p>
          </section>
          <section>
            <h2>{foundation.whyFirst.heading}</h2>
            {foundation.whyFirst.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
          <section class="guardrail">
            <h2>{lesson.misconceptionHeading}</h2>
            <p>{lesson.misconception}</p>
            {foundation.responsibilityWithoutShame.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
          <section>
            <h2>{foundation.explanation.heading}</h2>
            {foundation.explanation.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
          <section class="ownership-example">
            <h2>Everyday example</h2>
            <p>{lesson.example}</p>
            <div class="response-map">
              {presentation.response.map((part) => (
                <div key={part.heading}>
                  <h3>{part.heading}</h3>
                  <ul>
                    {part.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2>{foundation.help.heading}</h2>
            {foundation.help.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
          <section>
            <h2>{foundation.evidence.heading}</h2>
            {foundation.evidence.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
          <section>
            <h2>Put it into practice</h2>
            <p>{lesson.application}</p>
            <p class="reflection">{lesson.reflection}</p>
            <p class="small">No answer required.</p>
          </section>
          <section>
            <h2>{foundation.connected.heading}</h2>
            {foundation.connected.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </section>
          <section class="lesson-practice">
            <h2>Put Ownership into an ordinary moment</h2>
            <p>{presentation.practiceInvitation}</p>
            <p>{foundation.practiceBridge}</p>
            <div class="actions">
              <a class="button primary" href="#/period/practice">
                Practice Ownership
              </a>
              <a href="#/">Return to Why PERIOD?</a>
            </div>
            <p class="small">No written answer or Standard Card is required.</p>
          </section>
          <section class="transition">
            <div class="transition-path">
              <span>
                01 Ownership
                <br />
                <b>Responsibility</b>
              </span>
              <span aria-hidden="true">→</span>
              <span>
                02 Purpose
                <br />
                <b>Direction</b>
              </span>
            </div>
            <h2>{lesson.connectionHeading}</h2>
            <p>{lesson.connection}</p>
            <p>{purposeOwnershipHandoff}</p>
            <a href="#/period/values/purpose">Continue to Purpose</a>
          </section>
        </article>
      </div>
      <PeriodBook />
    </div>
  );
}
export function PeriodUnavailable() {
  return (
    <div class="period-learning period-unavailable">
      <PageIntro title="Choose a value">
        <p>{empowermentAvailability}</p>
      </PageIntro>
      <PeriodSequence />
      <a href="#/">Return to Why PERIOD?</a>
    </div>
  );
}
export function PeriodBook({ standalone = false }: { standalone?: boolean }) {
  return (
    <section class={`period-book book no-print ${standalone ? 'book-standalone' : ''}`}>
      <div class="book-title">
        <span>The complete book</span>
        <p class="book-name">
          The PERIOD
          <br />
          Code<span class="dot">.</span>
        </p>
        <p>Jim Lunsford</p>
      </div>
      <div>
        {standalone ? <h1 tabIndex={-1}>{book.heading}</h1> : <h2>{book.heading}</h2>}
        {standalone && (
          <p>
            The PERIOD Code: Six Non-Negotiable Values to Take Back Your Life and Keep It, by Jim
            Lunsford
          </p>
        )}
        {book.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <a href={book.url} rel="noreferrer">
          {book.label} <span aria-hidden="true">↗</span>
        </a>
        {standalone && (
          <p>
            <a href="#/period/values/ownership">Keep exploring Ownership</a>
          </p>
        )}
      </div>
    </section>
  );
}
