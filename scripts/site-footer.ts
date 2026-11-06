import {
  founderLinks,
  softwareNotice,
  footerEducation,
  footerBuildNotice,
  type FooterBuild,
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
export function siteNotices(build?: FooterBuild) {
  const state = footerBuildNotice(build),
    education = footerEducation();
  return `<div class="footer-provenance footer-notices">
<p class="founder-copyright">Copyright © ${link(founderLinks.author, 'Jim Lunsford')}. All rights reserved. A ${link(founderLinks.company, 'Phoenix 2:33 LLC')} Project.</p>
<p class="footer-software">${escape(softwareNotice.copyright)}${link('/LICENSE.txt', softwareNotice.license)}${escape(softwareNotice.permissions)}</p>
<p class="footer-education">${escape(education.text)} <span class="footer-education-url">${link(education.url, education.url)}</span></p>
<div class="footer-meta"><p>${escape(state.text)}${state.source ? ` · ${link(state.source, 'Corresponding source for this build')}` : ''}</p></div>
<div class="footer-print-urls"><p>${link(founderLinks.author, founderLinks.author)}<br>${link(founderLinks.company, founderLinks.company)}</p>${state.source ? `<p>Corresponding source: ${link(state.source, state.source)}</p>` : ''}<p>${link('https://www.gnu.org/licenses/agpl-3.0.html', 'https://www.gnu.org/licenses/agpl-3.0.html')}</p></div>
</div>`;
}

export function staticFooter(build?: FooterBuild) {
  return `<footer class="site-footer notice-footer">
<div class="footer-intro"><p>Only Empowerment</p><span>Free learning. Practical application.</span></div>
<nav class="footer-group" aria-label="About this site"><h2>About this site</h2>${link('/#/period/book', 'About the book')}${link('/#/privacy', 'Privacy & source')}</nav>
<p class="footer-app-note">The application links above require JavaScript. This reading, license and corresponding-source links do not.</p>
${siteNotices(build)}</footer>`;
}
