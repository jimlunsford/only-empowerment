import { useState } from 'preact/hooks';
import { PeriodSequence } from './PeriodLearning';
import { periodBook } from './period-content';
import {
  empowermentContent as content,
  empowermentAttribution,
  type EmpowermentReply,
  type EmpowermentReplyId,
} from './period-empowerment-content';

const lesson = content.lesson;
const copy = content.conversation;

function Paragraphs({ texts }: { texts: readonly string[] }) {
  return (
    <>
      {texts.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </>
  );
}

function LessonSections() {
  return (
    <>
      {lesson.sections.map((section) => (
        <section key={section.id} data-lesson-section={section.id}>
          <h2>{section.title}</h2>
          <Paragraphs texts={section.paragraphs} />
          {'connections' in section && (
            <dl class="empowerment-agreement empowerment-connections">
              {section.connections.map(({ value, text: meaning }) => (
                <div key={value}>
                  <dt>{value}</dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
          )}
          {'after' in section && <Paragraphs texts={section.after} />}
        </section>
      ))}
    </>
  );
}

function Speaker({ label, text }: { label: string; text: string }) {
  return (
    <div class="empowerment-speaker">
      <p class="empowerment-speaker-label">{label}</p>
      <blockquote>{text}</blockquote>
    </div>
  );
}

function ConversationSetup() {
  return (
    <section class="empowerment-setup">
      <h2>{copy.setupTitle}</h2>
      <Paragraphs texts={copy.setup} />
      <div class="empowerment-exchange empowerment-offer">
        <Speaker label="Dev asks" text={copy.request.text} />
        <Speaker label="Mara offers" text={copy.offer.text} />
      </div>
      <p class="empowerment-offer-note">{copy.offerNote}</p>
    </section>
  );
}

function Reply({ state }: { state: EmpowermentReply }) {
  return (
    <section class="empowerment-reply" data-reply={state.id}>
      <h2>{state.heading}</h2>
      <div class="empowerment-exchange empowerment-response">
        <Speaker label="Dev replies" text={state.recipient} />
        <Speaker label="Mara responds" text={state.helper} />
      </div>
      {'confirmation' in state && <p class="empowerment-confirmation">{state.confirmation}</p>}
      <h3>What is actually agreed</h3>
      <dl class="empowerment-agreement">
        {state.agreement.map(([role, responsibility]) => (
          <div key={role}>
            <dt>{role}</dt>
            <dd>{responsibility}</dd>
          </div>
        ))}
      </dl>
      <h3>{state.actionTitle}</h3>
      <p>{state.action}</p>
      <h3>What this shows</h3>
      <p>{state.interpretation}</p>
      <h3>What remains uncertain</h3>
      <p>{state.uncertainty}</p>
    </section>
  );
}

function ConversationConclusion() {
  return (
    <>
      <section class="empowerment-alternatives">
        <h2>{copy.alternativesTitle}</h2>
        <p>{copy.alternativesIntro}</p>
        {copy.alternatives.map((alternative) => (
          <section key={alternative.title}>
            <h3>{alternative.title}</h3>
            <Speaker label="Mara" text={alternative.message} />
            <p>{alternative.effect}</p>
            <p>{alternative.correction}</p>
          </section>
        ))}
      </section>
      <section class="empowerment-close">
        <h2>{copy.closeTitle}</h2>
        <Paragraphs texts={copy.close} />
        <h3>{copy.transferTitle}</h3>
        <p>{copy.transfer}</p>
        <p class="small">{copy.privacy}</p>
      </section>
    </>
  );
}

// One identical complete print flow on both routes, independent of the selected reply.
// CSS hides this from screen reading and reveals it only for printing.
function CompletePrintReading() {
  return (
    <article class="empowerment-print-only empowerment-print-reading">
      <h2 class="empowerment-print-title">{lesson.title}</h2>
      <p class="lead">{lesson.deck}</p>
      <Paragraphs texts={lesson.intro} />
      <LessonSections />
      <h2>{lesson.practiceTitle}</h2>
      <p>{lesson.practiceDescription}</p>
      <h2>{lesson.cardTitle}</h2>
      <p>{lesson.cardNote}</p>
      <h2>{lesson.bookTitle}</h2>
      <p>{lesson.bookNote}</p>
      <h2 class="empowerment-print-title">{copy.title}</h2>
      <p class="lead">{copy.deck}</p>
      <p>{copy.intro}</p>
      <p>
        All three fictional replies follow. They are alternatives to the same offer, not a sequence
        of events.
      </p>
      <ConversationSetup />
      <p class="empowerment-reflection">{copy.reflection}</p>
      {copy.states.map((state) => (
        <Reply key={state.id} state={state} />
      ))}
      <ConversationConclusion />
      <p class="source-note">{empowermentAttribution}</p>
    </article>
  );
}

export function EmpowermentLesson({ openCard }: { openCard: () => void }) {
  return (
    <>
      <div class="period-learning empowerment-layout empowerment-screen no-print">
        <header class="empowerment-heading">
          <h1 tabIndex={-1}>{lesson.title}</h1>
          <p class="lead">{lesson.deck}</p>
          <Paragraphs texts={lesson.intro} />
          <div class="empowerment-links">
            <a href="#/period/empowerment/conversation">{lesson.practiceLink}</a>
            <a href="/read/empowerment.html" target="_blank" rel="noopener noreferrer">
              {lesson.readingLink} (new tab)
            </a>
          </div>
        </header>
        <PeriodSequence active="empowerment" />
        <article class="empowerment-lesson" aria-label="Empowerment lesson">
          <LessonSections />
          <section class="empowerment-exit">
            <h2>{lesson.practiceTitle}</h2>
            <p>{lesson.practiceDescription}</p>
            <div class="empowerment-links">
              <a href="#/period/empowerment/conversation">{lesson.practiceLink}</a>
              <a href="#/period/teaching-order">{lesson.returnLink}</a>
            </div>
          </section>
          <section>
            <h2>{lesson.cardTitle}</h2>
            <p>{lesson.cardNote}</p>
            <a
              class="empowerment-text-link"
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
            <h2>{lesson.bookTitle}</h2>
            <p>{lesson.bookNote}</p>
            <a class="empowerment-text-link" href={periodBook.url} rel="noreferrer">
              {lesson.bookLink}
            </a>
          </section>
          <p class="source-note">{empowermentAttribution}</p>
        </article>
      </div>
      <CompletePrintReading />
    </>
  );
}

export function EmpowermentConversation() {
  const [reply, setReply] = useState<EmpowermentReplyId>(copy.defaultReply);
  const [status, setStatus] = useState('');
  const selected = copy.states.find((state) => state.id === reply)!;
  return (
    <>
      <div class="period-learning empowerment-layout empowerment-screen no-print">
        <header class="empowerment-heading">
          <h1 tabIndex={-1}>{copy.title}</h1>
          <p class="lead">{copy.deck}</p>
          <p>{copy.intro}</p>
          <div class="empowerment-links">
            <a href="/read/empowerment.html#conversation" target="_blank" rel="noopener noreferrer">
              {copy.readingLink} (new tab)
            </a>
            <a href="#/period/values/empowerment">{copy.lessonLink}</a>
          </div>
        </header>
        <PeriodSequence active="empowerment" focusOnly />
        <article
          class="empowerment-conversation"
          aria-label="Mara and Dev's fictional conversation"
        >
          <ConversationSetup />
          <fieldset class="empowerment-controls" aria-describedby="empowerment-control-hint">
            <legend>{copy.controlLegend}</legend>
            <p id="empowerment-control-hint">{copy.controlHint}</p>
            <div class="empowerment-options">
              {copy.states.map((state) => (
                <label key={state.id}>
                  <input
                    type="radio"
                    name="empowerment-reply"
                    value={state.id}
                    checked={reply === state.id}
                    onChange={() => {
                      if (reply === state.id) return;
                      setReply(state.id);
                      setStatus(state.status);
                    }}
                  />
                  <span>{state.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p role="status" aria-live="polite" aria-atomic="true" class="sr-only">
            {status}
          </p>
          <p class="empowerment-reflection">{copy.reflection}</p>
          <Reply state={selected} />
          <ConversationConclusion />
          <div class="empowerment-links">
            <a href="#/period/values/empowerment">{copy.lessonLink}</a>
            <a href="#/period/teaching-order">{lesson.returnLink}</a>
          </div>
          <p class="source-note">{empowermentAttribution}</p>
        </article>
      </div>
      <CompletePrintReading />
    </>
  );
}
