import {
  periodIntro as intro,
  periodValues,
  periodBook as book,
  periodExercise,
} from './period-content';
import { periodPresentation as presentation } from './period-presentation';
import { PageIntro } from './components/shared';
export function PeriodAttribution() {
  return <p class="source-note">{periodExercise.source}</p>;
}
export function PeriodSequence({ active = false }: { active?: boolean }) {
  return (
    <nav class={`period-sequence ${active ? 'lesson-nav' : ''}`} aria-label="PERIOD teaching order">
      {active && <h2>The six-value path</h2>}
      <ol class="path" role="list">
        {periodValues.map((v, index) => (
          <li key={v.id} class={active && v.id === 'ownership' ? 'selected' : undefined}>
            <span class="num" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <span class="path-name">
                {v.id === 'ownership' ? (
                  <a href="#/period/values/ownership" aria-current={active ? 'page' : undefined}>
                    {v.name}
                  </a>
                ) : (
                  <span>{v.name}</span>
                )}
              </span>
              <p>{v.role}</p>
            </div>
          </li>
        ))}
      </ol>
      <p class="path-note">
        Only Ownership is available as a lesson in this review. The full teaching order is shown.
      </p>
    </nav>
  );
}
export function PeriodIntro() {
  // Split the existing sentence for emphasis without tightening its wording.
  const distinction = intro.meaning[2].match(/[^.]+\./g)!;
  return (
    <div class="period-learning">
      <section class="intro-hero">
        <div class="intro-opening">
          <h1 tabIndex={-1}>
            Put your values <br />
            into <em>practice.</em>
          </h1>
          <p class="lead">{presentation.introLead}</p>
        </div>
        <aside class="period-panel" aria-labelledby="period-meaning-title">
          <p>The PERIOD Code by Jim Lunsford</p>
          <div class="period-word" aria-hidden="true">
            PERIOD<span>.</span>
          </div>
          <h2 id="period-meaning-title">Why PERIOD?</h2>
          {intro.meaning.slice(0, 2).map((p) => (
            <p key={p}>{p}</p>
          ))}
        </aside>
        <div class="intro-invitation">
          <div class="actions">
            <a class="button primary" href="#/period/values/ownership">
              Start with Ownership <span aria-hidden="true">→</span>
            </a>
            <a href="#/period/standard">Try a standard</a>
          </div>
          <p class="small">You can explore everything here without answering questions.</p>
        </div>
      </section>
      <section class="value-standard">
        <h2>{distinction[0].trim()}</h2>
        <div>
          <h2>{distinction[1].trim()}</h2>
          <p>{distinction[2].trim()}</p>
        </div>
      </section>
      <section class="comparison">
        <h2>{intro.comparison.heading}</h2>
        <p class="scenario">{intro.comparison.situation}</p>
        <div class="contrast">
          <section>
            <h3>The negotiation</h3>
            <blockquote>{intro.comparison.negotiation}</blockquote>
            <p>{intro.comparison.negotiationExplanation}</p>
          </section>
          <section class="standard">
            <h3>The standard</h3>
            <blockquote>{intro.comparison.standard}</blockquote>
            <p>{intro.comparison.standardExplanation}</p>
          </section>
        </div>
        <p class="takeaway">{intro.comparison.takeaway}</p>
        <details>
          <summary>{intro.comparison.disclosure}</summary>
          <p>{intro.comparison.adaptation}</p>
        </details>
      </section>
      <section class="sequence-section">
        <div>
          <h2>
            The name ends the negotiation.
            <br />
            <em>The order guides the work.</em>
          </h2>
          {intro.order.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <PeriodSequence />
      </section>
      <section class="origin">
        <h2>Built from lived experience.</h2>
        <p>{intro.origin}</p>
        <p>The PERIOD Code by Jim Lunsford</p>
      </section>
      <PeriodBook />
    </div>
  );
}
export function PeriodOwnership({ useOwnership }: { useOwnership: () => void }) {
  const value = periodValues[0],
    lesson = value.lesson;
  return (
    <div class="period-learning">
      <div class="lesson-layout">
        <PeriodSequence active />
        <article class="period-lesson">
          <div class="lesson-title">
            <p class="position">1 of 6 in the teaching order</p>
            <h1 tabIndex={-1}>
              Ownership
              <span class="dot" aria-hidden="true">
                .
              </span>
            </h1>
            <p class="lead">{value.role}</p>
          </div>
          <p class="small">
            Read the meaning, see an ordinary example, and consider one practical response. You do
            not need to type anything.
          </p>
          <section>
            <h2>Meaning</h2>
            <p>{lesson.meaning}</p>
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
          <section class="guardrail">
            <h2>{lesson.misconceptionHeading}</h2>
            <p>{lesson.misconception}</p>
          </section>
          <section>
            <h2>Put it into practice</h2>
            <p>{lesson.application}</p>
            <p class="reflection">{lesson.reflection}</p>
            <p class="small">No answer required.</p>
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
            <p class="small">The Purpose lesson is not included in this internal candidate.</p>
          </section>
          <div class="actions">
            <a class="button primary" href="#/period/standard" onClick={useOwnership}>
              Use Ownership in a standard
            </a>
            <a href="#/">Return to Why PERIOD?</a>
          </div>
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
        <p>
          Only Ownership is available as a lesson in this internal candidate. The full teaching
          order is shown below.
        </p>
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
