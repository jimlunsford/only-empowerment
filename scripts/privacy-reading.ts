import { privacySummary, privacyTracking } from '../src/privacy-content.ts';
import { withReadingNavigation } from './site-menu.ts';
import { staticFooter } from './site-footer.ts';
import { executionPrivacyCopy } from '../src/execution-content.ts';
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
  return withReadingNavigation(`<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<link rel="stylesheet" href="/read/privacy.css"><title>Privacy &amp; source | Only Empowerment</title></head>
<body class="period-shell"><a class="skip-link" href="#main">Skip to content</a>
<main id="main" class="site-main resilience-static" tabindex="-1">
<h1>Privacy &amp; source</h1>
<p>${escape(privacySummary)}</p>
<p>This page and the complete readings work without JavaScript.
<a href="/read/index.html">Open the complete reading index</a>,
<a href="/read/rebuild.html">read How to Rebuild Yourself</a>, or
<a href="/">return to Only Empowerment</a>.</p>
<section><h2>Your reading and practice</h2>
<p>You can read The PERIOD Code's six lessons, How to Rebuild Yourself's complete teaching and alternatives, The Discipline Loop, and Pure Execution Mode without an account or submitting personal answers. <a href="/read/standard.html">Read or print the paper Standard Card instructions</a>. The interactive examples and optional Standard Card require JavaScript. The Standard Card draft stays only in the open tab during application navigation, with no browser storage. Reloading or closing discards it; copy or print anything you want to keep.</p>
<p>${escape(executionPrivacyCopy)}</p>
</section>
<section><h2>Requests and tracking</h2>
<p>The Discipline Loop has fixed example choices and no personal entry fields. Its current choice stays only in page memory. Resetting, leaving the example or reloading discards that choice. Choices do not enter the URL, browser storage or a submission. <a href="/read/loop.html">Read the complete Loop teaching</a> or <a href="/read/loop-practice.html">every example outcome</a> without scripts.</p>
<p>Your browser requests files from the host. These requests expose ordinary connection information, such as your IP address and requested paths. Hosting systems keep operational logs; retention depends on the host, provider and backup policies. Answers are not included in ordinary application requests. Deleting old site data does not delete hosting logs.</p>
<p>${escape(privacyTracking)}</p>
${staging ? '<p>The request-log policy rotates daily and retains up to 14 rotated logs. Provider logs and backup retention are separate; this is not a promise that all infrastructure copies disappear after 14 days.</p>' : ''}</section>
<section><h2>If you used an earlier version of this site</h2>
<p>An earlier version may have saved records in this browser profile on this site. This application does not open, read, list, change, or automatically delete old saved records. Existing browser-local records remain on their original site origin. They are not encrypted by the application, and there is no server recovery or cross-device sync.</p>
<p>To remove old local data without JavaScript, close other tabs for this site and use your browser’s settings for this site’s stored data. This removes local site data, not clipboard copies, PDFs, backups, or hosting logs. The <a href="/#/privacy">application privacy controls</a> require JavaScript and offer a “Delete legacy tool data” button followed by “Confirm deletion of legacy data.” Cancel is focused first, and deletion affects only the earlier version’s storage keys.</p></section>
<section><h2>Copy, print and device privacy</h2>
<p>Copying puts the Standard Card on your device’s clipboard, which your operating system may sync. Printing or saving a PDF passes content to your browser and printing system. Clipboard copies, PDFs, printouts, screenshots, and backups are yours to manage and are not removed by deleting old site data.</p>
<p>This is not encrypted private storage. Shared devices, browser extensions, browser recovery features, screenshots, and a compromised device or host can expose information. No website can prove privacy simply by publishing its source.</p></section>
<section class="source-information"><h2>Software license and corresponding source</h2>
<p>${escape(softwareNotice.copyright)}<a href="/LICENSE.txt">${softwareNotice.license}</a>${escape(softwareNotice.permissions)}</p>
${source.source ? `<p><a href="${escape(source.source)}">Corresponding source</a></p>` : `<p>${escape(source.text)}</p>`}
<p>The source code is available for inspection. Public source helps you inspect intended behavior; a commit label alone does not prove that the delivered files match it. <a href="/build.json">Build metadata</a> and <a href="/SHA256SUMS">file checksums</a> remain available for deployment verification.</p>
<p><a href="/THIRD_PARTY_NOTICES.txt">Third-party notices</a>. The founder copyright statement does not limit the software permissions granted by AGPL-3.0-or-later.</p></section>
</main>${staticFooter(build, 'combined')}</body></html>`);
}
