import {
  lessonBridges,
  lessonTransition,
  type LessonValue,
} from '../src/period-lesson-transitions.ts';
const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export function readingTransition(value: LessonValue, level: 2 | 3 = 2) {
  const { current, next, forward, previous, ownership } = lessonTransition(value, true);
  const bridge = lessonBridges[value];
  const link = (item: { href: string; label: string }, primary = false) =>
    `<a${primary ? ' class="transition-next"' : ''} href="${item.href}">${escape(item.label)}</a>`;
  return `<section class="transition lesson-transition" data-value="${value}"${value === 'resilience' || value === 'integrity' ? ` id="${value}-L10"` : ''} aria-labelledby="reading-transition-${value}">
    <div class="transition-path"><span>${escape(current.label)}<br><b>${escape(current.role)}</b></span><span aria-hidden="true">→</span><span>${escape(next.label)}<br><b>${escape(next.role)}</b></span></div>
    <h${level} id="reading-transition-${value}">${escape(bridge.heading)}</h${level}>
    ${bridge.paragraphs.map((text) => `<p>${escape(text)}</p>`).join('')}
    ${bridge.note ? `<p class="small"><strong>${escape(bridge.note)}</strong></p>` : ''}
    <nav class="lesson-progression no-print" aria-label="${value[0].toUpperCase() + value.slice(1)} lesson progression">${link(forward, true)}
    ${previous ? `<div class="transition-previous">${link(previous)}${ownership ? link(ownership) : ''}</div>` : ''}</nav>
  </section>`;
}
