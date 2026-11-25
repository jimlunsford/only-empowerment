import { periodCardContext } from '../src/period-content.ts';
import {
  founderLinks,
  softwareNotice,
  footerEducation,
  footerBuildNotice,
  type FooterBuild,
  type EducationSource,
} from '../src/site-footer-content.ts';

const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
const link = (href: string, label: string) => `<a href="${escape(href)}">${escape(label)}</a>`;

// Fixed notices and build metadata only. Never receives or renders visitor-authored content.
export function siteNotices(build?: FooterBuild, source: EducationSource = 'period') {
  const state = footerBuildNotice(build),
    education = footerEducation(source);
  const combined = source === 'combined';
  const rebuildCredit = combined
    ? `<p class="rebuild-print-credit" hidden>${escape(footerEducation('rebuild').text)}</p>`
    : '';
  return `<div class="footer-provenance footer-notices">
<p class="founder-copyright">Copyright © ${link(founderLinks.author, 'Jim Lunsford')}. All rights reserved. A ${link(founderLinks.company, 'Phoenix 2:33 LLC')} Project.</p>
<div class="footer-print-urls"><p${combined ? ' class="combined-print-credit"' : ''}>${escape(education.text)}${education.url ? ' ' + link(education.url, education.url) : ''}</p>${rebuildCredit}<p>Software: ${link('https://www.gnu.org/licenses/agpl-3.0.html', softwareNotice.license)}. No warranty.</p>${state.source ? `<p>Corresponding source: ${link(state.source, state.source)}</p>` : ''}</div>
</div>`;
}

export function staticFooter(build?: FooterBuild, source: EducationSource = 'period') {
  return `<footer class="site-footer notice-footer">
<div class="footer-intro"><p>Only Empowerment</p><span>Free learning. Practical application.</span></div>
<nav class="footer-group" aria-label="About this site"><h2>About this site</h2>${link('/read/index.html', 'All complete readings') + link('/read/rebuild.html', 'How to Rebuild Yourself') + link('/read/execution.html', 'Pure Execution Mode') + link('/#/period/book', 'About the book')}${link('/read/privacy.html', 'Privacy & source')}</nav>
<nav class="footer-group" aria-label="Your practice"><h2>Your practice</h2><p>${escape(periodCardContext.footer)}</p>${link('/#/period/standard', 'Optional Standard Card')}${link('/#reading-standard-card', 'Use the standard on paper')}</nav>
<p class="footer-app-note">About the book and Optional Standard Card require JavaScript. Privacy &amp; source and these readings do not.</p>
${siteNotices(build, source)}</footer>`;
}
