import { homepage as c } from '../src/period-homepage-content.ts';
import { periodValues } from '../src/period-content.ts';

// Only fixed approved editorial content enters this build-time renderer.
const escape = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const p = (s: string, css = '') => `<p${css ? ` class="${css}"` : ''}>${escape(s)}</p>`;
const h3 = (s: string) => `<h3>${escape(s)}</h3>`;
const reading = (id: string) =>
  ['ownership', 'purpose'].includes(id) ? `#reading-${id}` : `/read/${id}.html`;
export function homepageFallback() {
  return `<div class="period-learning homepage">
<section class="home-hero" aria-labelledby="home-title"><h1 id="home-title" tabindex="-1">${escape(c.titleStart)}<em>${escape(c.titleEmphasis)}</em></h1><div class="home-hero-copy">${p(c.lead, 'lead')}${p(c.opening)}<a class="button primary" href="#first-moment">${escape(c.start)} <span aria-hidden="true">↓</span></a></div></section>
<section id="first-moment" class="home-moment home-ruled" tabindex="-1" aria-labelledby="home-moment-title"><div class="home-columns"><h2 id="home-moment-title">${escape(c.moment)}</h2><div>${p(c.comparison.situation, 'home-situation')}${p(c.notice, 'home-prompt')}</div></div>
<div class="home-comparison"><section class="home-negotiation">${h3('The negotiation')}<blockquote>${escape(c.comparison.negotiation)}</blockquote>${p(c.comparison.negotiationExplanation)}</section><section class="home-standard">${h3('The standard')}<blockquote>${escape(c.comparison.standard)}</blockquote>${p(c.comparison.standardExplanation)}</section></div>
<div class="home-teaching home-columns"><div>${h3(c.ownHeading)}${p(c.own)}${p(c.connection)}</div><div>${h3(c.valueHeading)}${p(c.value)}${p(c.evidence, 'home-emphasis')}</div></div><div class="home-limits">${h3(c.comparison.disclosure)}${p(c.comparison.adaptation)}</div></section>
<section class="home-reflection home-columns home-ruled" aria-labelledby="home-reflection-title"><h2 id="home-reflection-title">${escape(c.reflectionHeading)}</h2><div>${p(c.reflection, 'home-question')}${p(c.privateReflection)}${p(c.responsibility)}</div></section>
<section id="why-period" class="home-meaning home-columns home-ruled" tabindex="-1" aria-labelledby="home-why-title"><h2 id="home-why-title">Why <em>PERIOD?</em></h2><div>${p(c.why)}${p(c.connected)}</div></section>
<section id="teaching-order" class="home-values home-ruled" tabindex="-1" aria-labelledby="home-values-title"><div class="home-columns"><h2 id="home-values-title">${escape(c.valuesHeading)}</h2><div>${p(c.values)}${p(c.order)}</div></div><nav class="period-sequence" aria-label="PERIOD teaching order"><ol class="path" role="list">${periodValues.map((v, i) => `<li><span class="num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><span class="path-name"><a href="${reading(v.id)}">${escape(v.name)}</a></span>${p(v.role)}</div></li>`).join('')}</ol></nav><div class="home-continue"><a class="button primary" href="#reading-ownership">${escape(c.continue)} <span aria-hidden="true">→</span></a>${p(c.availability)}</div></section>
<section class="home-origin home-columns home-ruled"><h2>${escape(c.originHeading)}</h2><div>${p(c.origin)}${p(c.author, 'small')}</div></section>
<section class="home-book home-columns home-ruled"><h2>${escape(c.bookHeading)}</h2><div>${p(c.book)}<a href="${escape(c.bookUrl)}" rel="noreferrer">${escape(c.bookLink)} <span aria-hidden="true">↗</span></a></div></section>
<aside class="home-access home-ruled" aria-label="Reading and privacy"><p>${escape(c.access)} <a href="/read/privacy.html">${escape(c.privacy)}</a>${escape(c.privacyExplanation)}</p>${p(c.readingBoundary)}${p(c.legacy)}</aside>
</div>`;
}
