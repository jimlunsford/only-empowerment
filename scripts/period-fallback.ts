import {
  periodIntro as intro,
  periodValues,
  periodExercise as exercise,
  periodBook as book,
} from '../src/period-content.ts';
import { periodPresentation } from '../src/period-presentation.ts';
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
  return `<div class="period-learning period-reading">
    ${h2(intro.title)}${p(periodPresentation.introLead)}${p('The PERIOD Code by Jim Lunsford')}${p(intro.origin)}
    ${h2('Why PERIOD?')}${intro.meaning.map(p).join('')}
    ${h2(intro.comparison.heading)}${p(intro.comparison.situation)}
    <h3>The negotiation</h3>${p(intro.comparison.negotiation)}${p(intro.comparison.negotiationExplanation)}
    <h3>The standard</h3>${p(intro.comparison.standard)}${p(intro.comparison.standardExplanation)}${p(intro.comparison.takeaway)}
    <details><summary>${escape(intro.comparison.disclosure)}</summary>${p(intro.comparison.adaptation)}</details>
    ${h2(intro.orderHeading)}${intro.order.map(p).join('')}<ol>${periodValues.map((v) => `<li>${escape(v.name)}</li>`).join('')}</ol>
    ${p('This internal candidate includes Ownership. The other five lessons are not built yet.')}
    ${h2('Ownership')}${p(periodValues[0].role)}${p(lesson.meaning)}<h3>Everyday example</h3>${p(lesson.example)}
    <h3>${escape(lesson.misconceptionHeading)}</h3>${p(lesson.misconception)}<h3>Put it into practice</h3>${p(lesson.application)}${p(lesson.reflection)}
    <h3>${escape(lesson.connectionHeading)}</h3>${p(lesson.connection)}
    ${h2(exercise.title)}${p(exercise.lead)}${p(exercise.teaching)}${p(exercise.guardrail)}
    ${p('The card editor needs JavaScript. You can still use this pattern on paper: value, standard, next situation and action, and optional support or correction.')}
    ${h2('Example standard card')}${p('An illustration, not your personal commitment.')}${p('Status: Chosen, not yet demonstrated')}
    <h3>Value</h3>${p('Integrity')}<h3>My standard</h3>${p(exercise.example.standard)}<h3>Next situation and action</h3>${p(exercise.example.nextApplication)}<h3>Support or correction</h3>${p(exercise.example.returnPlan)}${p(exercise.exampleLesson)}${p(exercise.footnote)}${p(exercise.source)}
    <section class="no-print">${h2(book.heading)}${book.paragraphs.map(p).join('')}<a href="${book.url}" rel="noreferrer">${escape(book.label)}</a></section>
  </div>`;
}
