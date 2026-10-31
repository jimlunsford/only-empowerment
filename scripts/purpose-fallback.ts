import {
  purposeLesson,
  purposeRelationships,
  purposeConnected,
  purposeBridge,
  purposeCardNote,
  purposeCopy as copy,
  purposeDirections,
  purposeCapacities,
  purposeExamples,
  purposeBook,
} from '../src/period-purpose-content.ts';
import { periodBook } from '../src/period-content.ts';

// Build-time approved teaching only. All conditions are readable without runtime state.
export function purposeFallback() {
  const escape = (text: string) =>
    text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const p = (text: string) => `<p>${escape(text)}</p>`;
  const h = (text: string, level = 3) => `<h${level}>${escape(text)}</h${level}>`;
  return `<section aria-label="Purpose linear reading" id="reading-purpose">
    ${h('Purpose.', 2)}${p('2 of 6 in the teaching order')}${p('Give responsibility a direction.')}
    <nav aria-label="Purpose reading links"><a href="#reading-ownership">Return to Ownership</a> · <a href="#reading-purpose-evening">Explore one evening</a></nav>
    ${purposeLesson.map((part) => h(part.heading) + part.paragraphs.map(p).join('')).join('')}
    ${h('Purpose belongs to the whole Code')}${p(purposeConnected)}
    <ol>${purposeRelationships.map((item) => `<li>${h(item.value, 4)}${p(item.connection)}</li>`).join('')}</ol>
    ${h('Direction will meet pressure')}${purposeBridge.map(p).join('')}
    ${h('A reminder is optional')}${p(purposeCardNote)}
    ${h(purposeBook.heading)}${p(purposeBook.description)}<a href="${periodBook.url}" rel="noreferrer">${escape(purposeBook.label)}</a>
  </section>
  <section aria-label="Purpose evening linear reading" id="reading-purpose-evening">
    ${h(copy.title, 2)}${p(copy.lead)}${p(copy.intro)}
    ${h(copy.situation_heading)}${p(copy.situation)}${p(copy.facts)}${p(copy.assumptions)}
    ${p('The interactive controls need JavaScript. All four fictional examples are available below.')}
    ${p(copy.reflection)}${p(copy.planDistinction)}${p(copy.directionLimit)}
    ${Object.values(purposeExamples)
      .map(
        (example) => `<section>
      ${h(example.label)}${h('Direction in this example', 4)}${p(purposeDirections[example.direction].description)}
      ${h('Capacity tonight', 4)}${p(purposeCapacities[example.capacity].description)}${h('A possible evening', 4)}
      <ol>${example.plan.map((row) => `<li>${h(`${row.time} · ${row.title}`, 5)}${p(row.description)}</li>`).join('')}</ol>
      ${h('What this serves', 4)}${p(example.serves)}${h('What waits, and what it costs', 4)}${p(example.cost)}
      ${h('What this does not establish', 4)}${p(example.uncertain)}${p(example.compare)}
    </section>`,
      )
      .join('')}
    ${h(copy.same_evening_heading)}${p(copy.same_evening)}${p(copy.same_evening_end)}
    ${h(copy.close_heading)}${p(copy.close)}${p(copy.pressure)}${p(copy.reassurance)}
    <a href="#reading-purpose">Return to Purpose</a>
  </section>`;
}
