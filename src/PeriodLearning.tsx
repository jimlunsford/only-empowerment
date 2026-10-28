import {
  periodIntro as intro,
  periodValues,
  periodBook as book,
  periodExercise,
} from './period-content';
import { PageIntro } from './components/shared';
export function PeriodAttribution() {
  return <p class="source-note">{periodExercise.source}</p>;
}
export function PeriodSequence({ active = false }: { active?: boolean }) {
  return (
    <nav class="period-sequence" aria-label="PERIOD teaching order">
      <ol>
        {periodValues.map((v) => (
          <li key={v.id}>
            {v.id === 'ownership' ? (
              <a href="#/period/values/ownership" aria-current={active ? 'page' : undefined}>
                {v.name}
              </a>
            ) : (
              <span>{v.name}</span>
            )}
          </li>
        ))}
      </ol>
      <p class="small">
        This internal candidate includes the Ownership lesson. The other five lessons are not built
        yet.
      </p>
    </nav>
  );
}
export function PeriodIntro() {
  return (
    <div class="period-learning">
      <PageIntro title={intro.title}>
        <p>{intro.lead}</p>
      </PageIntro>
      <div class="period-reading">
        <p>The PERIOD Code by Jim Lunsford</p>
        <p>{intro.origin}</p>
        <section>
          <h2>Why PERIOD?</h2>
          {intro.meaning.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>
      </div>
      <section class="period-comparison">
        <h2>{intro.comparison.heading}</h2>
        <p>{intro.comparison.situation}</p>
        <div class="period-pair">
          <section>
            <h3>The negotiation</h3>
            <p class="period-statement">{intro.comparison.negotiation}</p>
            <p>{intro.comparison.negotiationExplanation}</p>
          </section>
          <section>
            <h3>The standard</h3>
            <p class="period-statement">{intro.comparison.standard}</p>
            <p>{intro.comparison.standardExplanation}</p>
          </section>
        </div>
        <p>{intro.comparison.takeaway}</p>
        <details>
          <summary>{intro.comparison.disclosure}</summary>
          <p>{intro.comparison.adaptation}</p>
        </details>
      </section>
      <section class="period-reading">
        <h2>{intro.orderHeading}</h2>
        {intro.order.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <PeriodSequence />
        <div class="actions">
          <a class="button primary" href="#/period/values/ownership">
            Start with Ownership
          </a>
          <a class="button" href="#/period/standard">
            Try a standard
          </a>
        </div>
        <p>You can explore everything here without answering questions.</p>
        <PeriodAttribution />
      </section>
    </div>
  );
}
export function PeriodOwnership({ useOwnership }: { useOwnership: () => void }) {
  const value = periodValues[0],
    lesson = value.lesson;
  return (
    <div class="period-learning">
      <div class="period-lesson-layout">
        <PeriodSequence active />
        <article class="period-reading">
          <h1 tabIndex={-1}>Ownership</h1>
          <p class="period-role">{value.role}</p>
          <p>
            Read the meaning, see an ordinary example, and consider one practical response. You do
            not need to type anything.
          </p>
          <section>
            <h2>Meaning</h2>
            <p>{lesson.meaning}</p>
          </section>
          <section>
            <h2>Everyday example</h2>
            <p>{lesson.example}</p>
          </section>
          <section>
            <h2>{lesson.misconceptionHeading}</h2>
            <p>{lesson.misconception}</p>
          </section>
          <section>
            <h2>Put it into practice</h2>
            <p>{lesson.application}</p>
            <p class="period-reflection">{lesson.reflection}</p>
            <p class="small">No answer required.</p>
          </section>
          <section>
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
          <PeriodAttribution />
        </article>
      </div>
      <PeriodBook />
    </div>
  );
}
export function PeriodUnavailable() {
  return (
    <div class="period-learning period-reading">
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
    <section class="period-book period-reading no-print">
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
      <p>
        <a href={book.url} rel="noreferrer">
          {book.label}
        </a>
      </p>
      <a href="#/period/values/ownership">Keep exploring Ownership</a>
    </section>
  );
}
