import {
  periodValues,
  ownershipFoundation as foundation,
  periodExercise as exercise,
  periodBook as book,
} from '../src/period-content.ts';
import { periodPresentation } from '../src/period-presentation.ts';
import { practiceFallback } from './practice-fallback.ts';
import { purposeFallback } from './purpose-fallback.ts';
import { purposeOwnershipHandoff } from '../src/period-purpose-content.ts';
import { homepageFallback } from './homepage-fallback.ts';
// Build-time, fixed editorial content only. Never receives a private draft.
const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const p = (text: string) => `<p>${escape(text)}</p>`;
const h2 = (text: string) => `<h2>${escape(text)}</h2>`;
export function periodFallback() {
  const lesson = periodValues[0].lesson;
  const section = (value: { heading: string; paragraphs: readonly string[] }) =>
    `<h3>${escape(value.heading)}</h3>${value.paragraphs.map(p).join('')}`;
  return `${homepageFallback()}<div class="period-learning period-reading">
    <h2 id="reading-ownership">Ownership</h2>${p(periodValues[0].role)}<h3>Meaning</h3>${p(lesson.meaning)}
    ${section(foundation.whyFirst)}
    <h3>${escape(lesson.misconceptionHeading)}</h3>${p(lesson.misconception)}${foundation.responsibilityWithoutShame.paragraphs.map(p).join('')}
    ${section(foundation.explanation)}
    <h3>Everyday example</h3>${p(lesson.example)}
    ${periodPresentation.response.map((part) => `<h4>${escape(part.heading)}</h4><ul>${part.actions.map((action) => `<li>${escape(action)}</li>`).join('')}</ul>`).join('')}
    ${section(foundation.help)}${section(foundation.evidence)}
    <h3>Put it into practice</h3>${p(lesson.application)}${p(lesson.reflection)}${p('No answer required.')}
    ${section(foundation.connected)}
    <section class="lesson-practice"><h3>Put Ownership into an ordinary moment</h3>${p(periodPresentation.practiceInvitation)}${p(foundation.practiceBridge)}
    <div class="actions"><a href="#reading-ownership-practice">Practice Ownership</a> <a href="#why-period">Return to Why PERIOD?</a></div>${p('No written answer or Standard Card is required.')}</section>
    <h3>${escape(lesson.connectionHeading)}</h3>${p(lesson.connection)}
    ${p(purposeOwnershipHandoff)}<a href="#reading-purpose">Continue to Purpose</a>
    ${practiceFallback()}
    ${purposeFallback()}
    ${h2(exercise.title)}${p(exercise.lead)}${p(exercise.teaching)}${p(exercise.guardrail)}
    ${p('The card editor needs JavaScript. You can still use this pattern on paper: value, standard, next situation and action, and optional support or correction.')}
    ${h2('Example standard card')}${p('An illustration, not your personal commitment.')}${p('Status: Chosen, not yet demonstrated')}
    <h3>Value</h3>${p('Integrity')}<h3>My standard</h3>${p(exercise.example.standard)}<h3>Next situation and action</h3>${p(exercise.example.nextApplication)}<h3>Support or correction</h3>${p(exercise.example.returnPlan)}${p(exercise.exampleLesson)}${p(exercise.footnote)}<p class="source-note">${escape(exercise.source)}</p>
    <section class="no-print">${h2(book.heading)}${book.paragraphs.map(p).join('')}<a href="${book.url}" rel="noreferrer">${escape(book.label)}</a></section>
  </div>`;
}
