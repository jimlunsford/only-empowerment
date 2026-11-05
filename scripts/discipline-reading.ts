import { staticFooter } from './site-footer.ts';
import type { FooterBuild } from '../src/site-footer-content.ts';
import {
  disciplineContent as content,
  disciplineAvailability,
  disciplineWayfinding,
} from '../src/period-discipline-content.ts';
import { periodBook, periodExercise } from '../src/period-content.ts';

const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const p = (text: string) => `<p>${escape(text)}</p>`;
const h = (text: string, level = 2) => `<h${level}>${escape(text)}</h${level}>`;
const link = (href: string, text: string) => `<a href="${href}">${escape(text)}</a>`;

// Build-time export of the approved visitor copy. All three patterns, no scripts.
export function disciplineReading(staging = true, metadata?: FooterBuild) {
  const lesson = content.lesson,
    copy = content.interaction;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<link rel="stylesheet" href="/read/discipline.css"><title>Discipline, complete reading | Only Empowerment</title></head>
<body class="period-shell"><a class="skip-link" href="#main">Skip to content</a>
<div class="period-review-notice no-print">${staging ? 'Development staging. Not a production release. ' : ''}Internal review. Teaching copy is proposed, not approved for public publication.</div>
<main id="main" class="site-main discipline-static" tabindex="-1" aria-label="Complete Discipline reading">
<nav id="top" class="no-print" aria-label="Discipline reading links">${link('/', 'Only Empowerment overview')}${link('/read/integrity.html', 'Read Integrity')}${link('#comparison', lesson.readingLink)}</nav>
<header class="discipline-heading"><h1 id="lesson">${escape(lesson.title)}</h1><p class="lead">${escape(lesson.deck)}</p>${lesson.intro.map(p).join('')}</header>
<p class="small no-print">${escape(disciplineAvailability)}</p>
<article class="discipline-lesson" aria-label="Discipline lesson">
${lesson.sections.map((section) => `<section id="discipline-${section.id}">${h(section.title)}${section.paragraphs.map(p).join('')}</section>`).join('')}
<section class="discipline-exit">${h('Examine the pattern')}${p(lesson.interactionDescription)}<div class="actions no-print">${link('/#/period/discipline/pattern', lesson.interactionLink + ' (requires JavaScript)')}${link('#comparison', lesson.readingLink)}</div></section>
<section>${h(lesson.cardTitle)}${p(lesson.cardDescription)}<p class="no-print">${link('/#/period/standard', lesson.cardLink + ' (requires JavaScript)')}</p></section>
<section>${h(lesson.nextTitle)}${p(lesson.nextDescription)}<p class="no-print">${link('/read/empowerment.html', lesson.nextLink)}</p></section>
<section>${p(lesson.bookDescription)}${link(periodBook.url, lesson.bookLink)}</section>
<p class="no-print">${link('#top', 'Back to top')}</p></article>
<article class="discipline-comparison" aria-label="Noor and Eli's fictional patterns">
<h2 id="comparison" tabindex="-1">${escape(copy.readingTitle)}</h2><p class="lead">${escape(copy.deck)}</p>${p(copy.readingIntro)}${copy.intro.map(p).join('')}<p class="discipline-prompt">${escape(copy.readerPrompt)}</p>
<nav class="discipline-wayfinding no-print" aria-label="Within the comparison">${disciplineWayfinding.map((item) => link('#occasion-' + item.id, item.label)).join('')}</nav>
<h3 class="discipline-print-only">All three fictional patterns</h3>
${copy.moments
  .map(
    (
      moment,
    ) => `<section class="discipline-occasion" data-occasion="${moment.id}"><h3 id="occasion-${moment.id}" tabindex="-1">${escape(moment.title)}</h3>${p(moment.context)}
<div class="discipline-actions"><section class="discipline-pattern">${h(copy.fixedLabel, 4)}${p(moment.reference)}</section>${copy.choices.map((choice) => `<section class="discipline-pattern">${h(choice.label, 4)}${p(moment[choice.id])}</section>`).join('')}</div>
${h('What this establishes', 4)}${p(moment.interpretation)}${h('A responsible response', 4)}${p(moment.correction)}</section>`,
  )
  .join('')}
<section class="discipline-conclusion">${h(copy.conclusionTitle, 3)}${copy.conclusion.map(p).join('')}<p class="discipline-prompt">${escape(copy.transferPrompt)}</p>${link('#lesson', copy.backLink)}</section>
</article><p class="source-note">${escape(periodExercise.source)}</p></main>${staticFooter(metadata)}</body></html>`;
}
