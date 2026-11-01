import { resilienceContent as content } from '../src/period-resilience-content.ts';
import { resilienceUi as ui } from '../src/period-resilience-state.ts';
import { periodBook } from '../src/period-content.ts';

// One bounded build-time reading export. Fixed editorial content only, no application state.
const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const p = (text: string) => `<p>${escape(text)}</p>`;
const h = (text: string, level = 2) => `<h${level}>${escape(text)}</h${level}>`;
const link = (href: string, text: string) => `<a href="${href}">${escape(text)}</a>`;

export function resilienceReading(staging = true) {
  const copy = content.activity;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<link rel="stylesheet" href="/read/resilience.css"><title>Resilience, complete reading | Only Empowerment</title></head>
<body class="period-shell"><a class="skip-link" href="#main">Skip to content</a>
<div class="period-review-notice">${staging ? 'Development staging. Not a production release. ' : ''}Internal review. Teaching copy is proposed, not approved for public publication.</div>
<main id="main" class="site-main resilience-static" tabindex="-1" aria-label="Complete Resilience reading">
<nav aria-label="Resilience reading links">${link('/', 'Only Empowerment')}${link('#resilience-lesson', 'Read Resilience')}${link('#pressure-notes', 'Read all five pressure notes')}</nav>
<header class="resilience-heading"><p class="position">3 of 6 in the teaching order</p>${h(content.title, 1)}<p class="lead">${escape(content.lead)}</p></header>
<article class="resilience-lesson" id="resilience-lesson" aria-label="Resilience lesson">
${content.lesson
  .map(
    (
      section,
    ) => `<section id="resilience-${section.id}">${h(section.heading)}${section.paragraphs.map(p).join('')}
${section.id === 'L08' ? link('#pressure-notes', section.cta) + p(section.hint) : ''}
${section.id === 'L09' ? `<ol class="resilience-connections">${content.values.map(([name, text]) => `<li>${h(name, 3)}${p(text)}</li>`).join('')}</ol>` : ''}
${section.id === 'L10' ? p(section.availability) : ''}
${section.id === 'L11' ? link('/#/period/standard', section.cta) : ''}
${section.id === 'L12' ? link(periodBook.url, section.cta) : ''}</section>`,
  )
  .join('')}
</article>
<article id="pressure-notes" aria-label="All pressure notes, complete reading">
${h(copy.title)}<p class="lead">${escape(copy.lead)}</p>${p(copy.intro)}
<section class="resilience-setup">${h(ui.setupHeading, 3)}${p(copy.setup)}
<div class="resilience-anchors"><div>${h('The direction', 3)}${p(copy.aim)}</div><div>${h('The standard', 3)}${p(copy.standard)}</div></div></section>
${p(copy.reflection)}<section class="resilience-shared" aria-label="Understanding the comparison">${p(copy.shared)}${p(ui.refinement)}</section>
${h(ui.readingHeading)}${p(ui.readingIntro)}
${content.states
  .map(
    (
      note,
    ) => `<section class="resilience-reading-note" aria-label="Full pressure note: ${escape(note.name)}">
${h(note.name)}${p(note.facts)}
<div class="resilience-methods"><section><p class="resilience-method-label">The current method</p>${h(ui.currentHeading, 3)}${p(note.method)}</section>
<section class="resilience-revision"><p class="resilience-method-label">One possible revision</p>${h(ui.revisionHeading, 3)}${p(note.revision)}</section></div>
<div class="resilience-consequences"><section>${h(ui.retainHeading, 3)}${p(note.retain)}</section><section>${h(ui.costHeading, 3)}${p(note.cost)}</section><section>${h(ui.reviewHeading, 3)}${p(note.review)}</section></div>
<div class="resilience-responses">${note.responses.map((response) => `<section>${h(response.title, 3)}${p(response.text)}</section>`).join('')}</div>
${note.id === 'missed' ? `<section class="resilience-return">${h(copy.returnTitle, 3)}${p(copy.returnCopy)}${h(ui.returnLabel, 4)}${p(copy.returnStory)}</section>` : ''}</section>`,
  )
  .join('')}
${p(copy.closing)}<section class="resilience-close">${h(ui.closeHeading)}${p(ui.close)}${link('#resilience-lesson', 'Return to Resilience')}${p(content.lesson[9].availability)}</section>
</article><p class="source-note">${escape(content.attribution)}</p></main></body></html>`;
}
