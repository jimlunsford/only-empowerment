import { LessonTitle } from './LessonTitle';
import { LessonParagraphs } from './LessonParagraphs';
import { useState } from 'preact/hooks';
import { PeriodSequence } from './PeriodLearning';
import { periodBook, periodExercise } from './period-content';
import {
  disciplineContent as content,
  disciplineWayfinding,
  type DisciplineChoice,
} from './period-discipline-content';
import { disciplineAnchor, disciplineLessonAnchor } from './period-discipline-navigation';

const lesson = content.lesson;
const copy = content.interaction;

export function DisciplineLesson({ openCard }: { openCard: () => void }) {
  return (
    <div class="period-learning discipline-layout value-lesson">
      <header class="discipline-heading lesson-heading">
        <p class="position">5 of 6 in the teaching order</p>
        <h1 tabIndex={-1}>
          <LessonTitle text={lesson.title} />
        </h1>
        <p class="lead">{lesson.deck}</p>
      </header>
      <PeriodSequence active="discipline" lesson />
      <div class="lesson-local">
        {' '}
        <p class="discipline-reading-link no-print">
          <a href="/read/discipline.html" target="_blank" rel="noopener noreferrer">
            Read the complete lesson and example (new tab)
          </a>
        </p>
      </div>
      <article class="discipline-lesson lesson-copy" aria-label="Discipline lesson">
        {lesson.intro.map((text) => (
          <p key={text}>{text}</p>
        ))}
        {lesson.sections.map((section) => (
          <section
            key={section.id}
            class={
              (
                {
                  'repetition-builds-evidence': 'discipline-repetition',
                  'act-through-ordinary-resistance': 'discipline-resistance',
                  'serve-the-standard': 'discipline-limits',
                  'correct-the-miss': 'discipline-correction',
                } as Record<string, string>
              )[section.id]
            }
          >
            <h2 id={`discipline-${section.id}`}>{section.title}</h2>
            <LessonParagraphs
              texts={section.paragraphs}
              treatment={
                section.id === 'repetition-builds-evidence'
                  ? 'discipline-repetition'
                  : section.id === 'correct-the-miss'
                    ? 'discipline-correction'
                    : undefined
              }
            />
          </section>
        ))}
        <section class="discipline-exit">
          <h2 id={disciplineLessonAnchor} tabIndex={-1}>
            Examine the pattern
          </h2>
          <p>{lesson.interactionDescription}</p>
          <div class="actions no-print">
            <a class="button primary" href="#/period/discipline/pattern">
              {lesson.interactionLink}
            </a>
            <a href="/read/discipline.html#comparison" target="_blank" rel="noopener noreferrer">
              {lesson.readingLink}
            </a>
          </div>
        </section>
        <section>
          <h2>{lesson.cardTitle}</h2>
          <p>{lesson.cardDescription}</p>
          <a
            class="discipline-text-link no-print"
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
            {lesson.cardLink}
          </a>
        </section>
        <section>
          <h2>{lesson.nextTitle}</h2>
          <p>{lesson.nextDescription}</p>
          <a class="discipline-text-link no-print" href="#/period/values/empowerment">
            {lesson.nextLink}
          </a>
        </section>
        <section>
          <p>{lesson.bookDescription}</p>
          <a class="discipline-text-link no-print" href={periodBook.url} rel="noreferrer">
            {lesson.bookLink}
          </a>
        </section>
        <p class="source-note">{periodExercise.source}</p>
      </article>
    </div>
  );
}

// Only a fictional comparison choice lives here. No draft, saved record or URL selection.
export function DisciplinePattern() {
  const [choice, setChoice] = useState<DisciplineChoice>(copy.defaultChoice);
  const [status, setStatus] = useState('');
  return (
    <div class="period-learning discipline-layout discipline-comparison-layout">
      <header class="discipline-heading">
        <h1 tabIndex={-1}>{copy.title}</h1>
        <p class="lead">{copy.deck}</p>
        {copy.intro.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <p class="discipline-prompt">{copy.readerPrompt}</p>
      </header>
      <PeriodSequence active="discipline" focusOnly />
      <article class="discipline-comparison" aria-label="Noor and Eli's fictional patterns">
        <a
          class="discipline-reading-link no-print"
          href="/read/discipline.html#comparison"
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.readingLink}
        </a>
        <nav class="discipline-wayfinding no-print" aria-label="Within the comparison">
          {disciplineWayfinding.map((link) => (
            <a key={link.id} href={`#${disciplineAnchor(link.id)}`}>
              {link.label}
            </a>
          ))}
        </nav>
        <fieldset class="discipline-controls no-print">
          <legend>{copy.choiceLegend}</legend>
          {copy.choices.map((option) => (
            <label key={option.id}>
              <input
                type="radio"
                name="discipline-comparison"
                value={option.id}
                checked={choice === option.id}
                onChange={() => {
                  if (choice === option.id) return;
                  setChoice(option.id);
                  setStatus(option.status);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        <p role="status" aria-live="polite" aria-atomic="true" class="sr-only no-print">
          {status}
        </p>
        <div class="discipline-print-only">
          <h2>All three fictional patterns</h2>
          <p>{copy.readingIntro}</p>
        </div>
        {copy.moments.map((moment) => (
          <section class="discipline-occasion" key={moment.id} data-occasion={moment.id}>
            <h2 id={disciplineAnchor(moment.id)} tabIndex={-1}>
              {moment.title}
            </h2>
            <p class="discipline-context">{moment.context}</p>
            <div class="discipline-actions">
              <section class="discipline-pattern" data-pattern="reference">
                <h3>{copy.fixedLabel}</h3>
                <p>{moment.reference}</p>
              </section>
              {copy.choices.map((option) => (
                <section
                  class={`discipline-pattern ${choice !== option.id ? 'discipline-print-only' : ''}`}
                  key={option.id}
                  data-pattern={option.id}
                >
                  <h3>{option.label}</h3>
                  <p>{moment[option.id]}</p>
                </section>
              ))}
            </div>
            <h3>What the actions show</h3>
            <p class="discipline-interpretation no-print">{moment.interpretations[choice]}</p>
            <p class="discipline-print-only">{moment.interpretation}</p>
            <h3>A responsible response</h3>
            <p class="discipline-correction">{moment.correction}</p>
          </section>
        ))}
        <section class="discipline-conclusion">
          <h2>{copy.conclusionTitle}</h2>
          {copy.conclusion.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <p class="discipline-prompt">{copy.transferPrompt}</p>
          <a class="discipline-text-link no-print" href={`#${disciplineLessonAnchor}`}>
            {copy.backLink}
          </a>
        </section>
        <p class="source-note">{periodExercise.source}</p>
      </article>
    </div>
  );
}
