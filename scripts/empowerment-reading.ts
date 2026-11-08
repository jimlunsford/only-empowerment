import { readingTransition } from './lesson-transition.ts';
import { staticFooter } from './site-footer.ts';
import type { FooterBuild } from '../src/site-footer-content.ts';
import {
  empowermentContent as content,
  empowermentAttribution,
  empowermentAvailability,
} from '../src/period-empowerment-content.ts';
import { periodBook } from '../src/period-content.ts';

const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const p = (text: string) => `<p>${escape(text)}</p>`;
const h = (text: string, level = 2) => `<h${level}>${escape(text)}</h${level}>`;
const link = (href: string, text: string) => `<a href="${href}">${escape(text)}</a>`;
const speaker = (label: string, text: string) =>
  `<div class="empowerment-speaker"><p class="empowerment-speaker-label">${escape(label)}</p><blockquote>${escape(text)}</blockquote></div>`;
const agreement = (rows: readonly (readonly string[])[]) =>
  `<dl class="empowerment-agreement">${rows.map(([label, text]) => `<div><dt>${escape(label)}</dt><dd>${escape(text)}</dd></div>`).join('')}</dl>`;

// Entire shared lesson and authored example at build time. No scripts or hidden teaching.
export function empowermentReading(staging = true, metadata?: FooterBuild) {
  const lesson = content.lesson,
    c = content.conversation;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<link rel="stylesheet" href="/read/empowerment.css"><title>Empowerment, complete reading | Only Empowerment</title></head>
<body class="period-shell"><a class="skip-link" href="#main">Skip to content</a>
<main id="main" class="site-main empowerment-static" tabindex="-1" aria-label="Complete Empowerment reading">
<nav class="no-print" aria-label="Earlier PERIOD reading">${link('/#reading-ownership', 'Read Ownership')}${link('/#reading-purpose', 'Read Purpose')}${link('/read/resilience.html', 'Read Resilience')}${link('/read/integrity.html', 'Read Integrity')}${link('/read/discipline.html', 'Read Discipline')}${link('/', 'Only Empowerment overview')}</nav>
<nav class="no-print" aria-label="Within the complete reading">${link('#lesson', 'Lesson')}${link('#offer', 'Original offer')}${c.states.map((s) => link('#reply-' + s.id, s.label)).join('')}${link('#alternatives', 'Other responses')}${link('#conclusion', 'Conclusion')}</nav>
<header id="lesson" class="empowerment-heading"><h1>${escape(lesson.title)}</h1><p class="lead">${escape(lesson.deck)}</p>${lesson.intro.map(p).join('')}</header>
<p class="small no-print">${escape(empowermentAvailability)}</p>
<article class="empowerment-lesson" aria-label="Empowerment lesson">
${lesson.sections.map((s) => `<section id="${s.id}">${h(s.title)}${s.paragraphs.map(p).join('')}${'connections' in s ? agreement(s.connections.map((c) => [c.value, c.text])) : ''}${'after' in s ? s.after.map(p).join('') : ''}</section>`).join('')}
<section class="empowerment-exit">${h(lesson.practiceTitle)}${p(lesson.practiceDescription)}<div class="empowerment-links no-print">${link('/#/period/empowerment/conversation', lesson.practiceLink + ' (requires JavaScript)')}${link('#conversation', lesson.readingLink)}</div></section>
<section>${h(lesson.cardTitle)}${p(lesson.cardNote)}<p class="no-print">${link('/#/period/standard', lesson.cardLink + ' (requires JavaScript)')}</p></section>
${readingTransition('empowerment')}
<section>${h(lesson.bookTitle)}${p(lesson.bookNote)}<p class="no-print">${link(periodBook.url, lesson.bookLink)}</p></section></article>
<article class="empowerment-conversation" aria-label="Mara and Dev's fictional conversation">
<h2 id="conversation">${escape(c.title)}</h2><p class="lead">${escape(c.deck)}</p>${p(c.intro)}
<p>All three fictional replies follow. They are alternatives to the same offer, not a sequence of events.</p>
<section class="empowerment-setup"><h3 id="offer">${escape(c.setupTitle)}</h3>${c.setup.map(p).join('')}
<div class="empowerment-exchange empowerment-offer">${speaker(c.request.speaker, c.request.text)}${speaker(c.offer.speaker, c.offer.text)}</div>${p(c.offerNote)}</section>
<p class="empowerment-reflection">${escape(c.reflection)}</p>
${c.states.map((s) => `<section class="empowerment-reply" data-reply="${s.id}"><h3 id="reply-${s.id}">${escape(s.heading)}</h3><div class="empowerment-exchange empowerment-response">${speaker('Dev replies', s.recipient)}${speaker('Mara responds', s.helper)}</div>${'confirmation' in s ? `<p class="empowerment-confirmation">${escape(s.confirmation)}</p>` : ''}${h('What is actually agreed', 4)}${agreement(s.agreement)}${h(s.actionTitle, 4)}${p(s.action)}${h('What this shows', 4)}${p(s.interpretation)}${h('What remains uncertain', 4)}${p(s.uncertainty)}</section>`).join('')}
<section class="empowerment-alternatives"><h3 id="alternatives">${escape(c.alternativesTitle)}</h3>${p(c.alternativesIntro)}${c.alternatives.map((a) => `<section>${h(a.title, 4)}${speaker('Mara', a.message)}${p(a.effect)}${p(a.correction)}</section>`).join('')}</section>
<section class="empowerment-close"><h3 id="conclusion">${escape(c.closeTitle)}</h3>${c.close.map(p).join('')}${h(c.transferTitle, 4)}${p(c.transfer)}${p(c.privacy)}</section>
<div class="empowerment-links no-print">${link('#lesson', c.lessonLink)}${link('#conversation', c.readingLink)}</div>
</article><p class="source-note">${escape(empowermentAttribution)}</p></main>${staticFooter(metadata)}</body></html>`;
}
