import { staticFooter } from './site-footer.ts';
import type { FooterBuild } from '../src/site-footer-content.ts';
import { integrityContent as content } from '../src/period-integrity-content.ts';
import { periodBook } from '../src/period-content.ts';

// Complete linear export of the same fixed editorial source. No visitor state or scripts.
const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const p = (text: string) => `<p>${escape(text)}</p>`;
const h = (text: string, level = 2) => `<h${level}>${escape(text)}</h${level}>`;
const link = (href: string, text: string) => `<a href="${href}">${escape(text)}</a>`;
const top = () => `<p class="integrity-back-top">${link('#top', 'Back to top')}</p>`;

export function integrityReading(staging = true, metadata?: FooterBuild) {
  const copy = content.case;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<link rel="stylesheet" href="/read/integrity.css"><title>Integrity, complete reading | Only Empowerment</title></head>
<body class="period-shell"><a class="skip-link" href="#main">Skip to content</a>
<div class="period-review-notice">${staging ? 'Development staging. Not a production release. ' : ''}Internal review. Teaching copy is proposed, not approved for public publication.</div>
<main id="main" class="site-main integrity-static" tabindex="-1" aria-label="Complete Integrity reading">
<nav id="top" aria-label="Integrity reading links">${link('/', 'Only Empowerment overview')}${link('/read/resilience.html', 'Read Resilience')}</nav>
<header class="integrity-heading"><p class="position">4 of 6 in the teaching order</p>${h(content.title, 1)}<p class="lead">${escape(content.lead)}</p></header>
<nav aria-label="Contents">${link('#lesson', 'Read Integrity')}${link('#record', 'Read the fictional record')}${link('#annotations', 'Read all three annotations')}${link('#comparison', 'Compare responses')}${link('#correction', 'Read the correction')}${link('#continuation', 'Read what actually happens')}</nav>
${p(content.navigation.availability)}
<article id="lesson" class="integrity-lesson" aria-label="Integrity lesson">
${content.lesson.map((section) => `<section id="integrity-${section.id}">${h(section.heading)}${section.paragraphs.map(p).join('')}${section.id === content.activity_invitation.after ? link('#record', content.activity_invitation.label) + p(content.activity_invitation.hint) : ''}${section.id === 'L10' ? p(content.availability) + link('/read/discipline.html', 'Continue to Discipline') : ''}</section>`).join('')}
<section class="integrity-reminder">${h('A reminder is optional')}${p(content.card)}${link('/#/period/standard', 'Write an optional Standard Card (requires JavaScript)')} ${link('/read/resilience.html', 'Return to Resilience')}</section>
<section>${h('Explore the complete PERIOD Code')}${p(content.book)}${link(periodBook.url, "Explore the book on Jim's website")}</section>${top()}</article>
<article id="record" class="integrity-record" aria-label="Riley and Maya's fictional record">
${h(copy.title)}<p class="lead">${escape(copy.lead)}</p>${p(copy.intro)}
<section class="integrity-setup">${h('The situation')}${p(copy.setup)}
<div class="integrity-evidence"><section class="integrity-message">${h('The message Riley sent', 3)}${p(copy.original)}</section><section class="integrity-facts">${h('The known record', 3)}<ol>${copy.facts.map((fact) => `<li>${escape(fact)}</li>`).join('')}</ol></section></div>
<p class="integrity-challenge">${escape(copy.challenge)}</p><p class="integrity-reflection">${escape(copy.reflection)}</p></section>
<section id="annotations" aria-label="All three annotations, expanded">
${copy.notes
  .map(
    (
      note,
    ) => `<section class="integrity-reading-note" id="integrity-note-${note.id}">${h(note.label)}<p class="integrity-claim">${escape(note.claim)}</p><div class="integrity-note-body">
${h('What the record shows', 3)}${p(note.fact)}${h('Why it matters', 3)}${p(note.explanation)}${h('replacement_label' in note ? note.replacement_label : 'A truthful replacement', 3)}${p(note.replacement)}${h('Action beyond wording', 3)}${p(note.action)}${h('What this cannot settle', 3)}${p(note.limit)}</div></section>`,
  )
  .join('')}${top()}</section>
<section id="comparison" class="integrity-comparison">${h('What each response leaves in place')}${p(copy.comparison_intro)}${copy.responses.map(([heading, words, result]) => `<section>${h(heading, 3)}<blockquote>${escape(words)}</blockquote>${p(result)}</section>`).join('')}</section>
<section id="correction" class="integrity-correction">${h('A correction that reaches the same audience')}<blockquote>${escape(copy.correction)}</blockquote>${p(copy.correction_note)}</section>
<section id="continuation" class="integrity-continuation">${h(copy.continuation_title)}${copy.continuation.map(p).join('')}${p(copy.evidence)}</section>
<section class="integrity-limits">${h("What remains outside Riley's control")}${p(copy.limits)}${p(copy.closure)}${p(copy.bridge)}${link('/read/discipline.html', 'Continue to Discipline')}${link('#lesson', 'Return to Integrity')}</section>${top()}
</article><p class="source-note">${escape(content.attribution)}</p></main>${staticFooter(metadata)}</body></html>`;
}
