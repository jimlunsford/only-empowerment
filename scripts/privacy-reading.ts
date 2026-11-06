import { staticFooter } from './site-footer.ts';
import { footerBuildNotice, softwareNotice, type FooterBuild } from '../src/site-footer-content.ts';

const escape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
// Fixed public information only. This document has no script or access to browser records.
export function privacyReading(staging = true, build?: FooterBuild) {
  const source = footerBuildNotice(build);
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<link rel="stylesheet" href="/read/privacy.css"><title>Privacy &amp; source | Only Empowerment</title></head>
<body class="period-shell"><a class="skip-link" href="#main">Skip to content</a>
<main id="main" class="site-main resilience-static" tabindex="-1">
<h1>Privacy &amp; source</h1>
<p>This page and the complete readings work without JavaScript. <a href="/">Return to Only Empowerment</a>.</p>
<section><h2>Your reading and practice</h2>
<p>You can read the six lessons without an account or submitting personal answers. The interactive examples and optional Standard Card require JavaScript. The Standard Card draft stays only in the open tab during application navigation, with no browser storage. Reloading or closing can discard it; copy or print anything you want to keep.</p>
<p>Earlier tools, Saved work and Approach are retired. This application does not open, read, list, change, or automatically delete old saved records. Existing browser-local records remain on their original site origin. They are not encrypted by the application, and there is no server recovery or cross-device sync.</p>
<p>To remove old local data without JavaScript, close other tabs for this site and use your browser’s settings for this site’s stored data. This removes local site data, not clipboard copies, PDFs, backups, or hosting logs. The <a href="/#/privacy">application privacy controls</a> require JavaScript and offer deliberate, confirmed deletion of only the retired tools’ storage keys.</p></section>
<section><h2>Requests and tracking</h2>
<p>Your browser requests files from the host. These requests expose ordinary connection information, such as your IP address and requested paths. Hosting systems keep operational logs; retention depends on the host, provider and backup policies. Google Analytics is not enabled in this build. No AI service or remote fonts are used. External links contact their destinations only when you choose them.</p>
${staging ? '<p>The staging policy rotates daily and retains up to 14 rotated logs. Provider logs and backup retention are separate.</p>' : ''}</section>
<section class="source-information"><h2>Software license and corresponding source</h2>
<p>${escape(softwareNotice.copyright)}<a href="/LICENSE.txt">${softwareNotice.license}</a>${escape(softwareNotice.permissions)}</p>
${source.source ? `<p><a href="${escape(source.source)}">Corresponding source for this build</a></p>` : `<p>${escape(source.text)}</p>`}
<p>This page identifies this build’s corresponding source. Public source helps you inspect intended behavior; a commit label alone does not prove that the delivered files match it. <a href="/build.json">Build metadata</a> and <a href="/SHA256SUMS">file checksums</a> remain available for deployment verification.</p>
<p><a href="/THIRD_PARTY_NOTICES.txt">Third-party notices</a>. The founder copyright statement does not limit the software permissions granted by AGPL-3.0-or-later.</p></section>
</main>${staticFooter(build)}</body></html>`;
}
