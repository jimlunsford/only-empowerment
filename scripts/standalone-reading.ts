import { withDesktopNavigation } from './site-menu.ts';
import { periodFallback } from './period-fallback.ts';
import { purposeFallback } from './purpose-fallback.ts';
import { rebuildFallback } from './rebuild-fallback.ts';
import { staticFooter } from './site-footer.ts';
import type { FooterBuild } from '../src/site-footer-content.ts';

// The same fixed teaching sources used in the application generate static pages.
// No personal data, application scripts or runtime HTML injection.
const shell = (
  title: string,
  body: string,
  style: string,
  build?: FooterBuild,
  framework: 'period' | 'rebuild' | 'combined' = 'period',
  staging = true,
) =>
  withDesktopNavigation(
    [
      '<!doctype html><html lang="en"><head><meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      `<meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer">`,
      "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'\">",
      // Native fragment restoration has no script to realign it after font loading.
      // Preloads let WebKit finish the reading fonts before the document load event.
      framework === 'rebuild'
        ? [
            'SourceSerif4-Regular.otf.woff2',
            'SourceSerif4-Semibold.otf.woff2',
            'SourceSerif4-It.otf.woff2',
            'SourceSans3-Regular.otf.woff2',
            'SourceSans3-Semibold.otf.woff2',
            'SourceSans3-Bold.otf.woff2',
          ]
            .map(
              (file) =>
                `<link rel="preload" href="/fonts/${file}" as="font" type="font/woff2" crossorigin>`,
            )
            .join('')
        : '',
      '<link rel="stylesheet" href="',
      style,
      '"><title>',
      title,
      ' | Only Empowerment</title></head>',
      `<body class="site-shell period-shell${framework === 'rebuild' ? ' native-rebuild' : ''}"><a class="skip-link" href="#main">Skip to content</a>`,
      '<header class="site-header"><a class="wordmark" href="/read/index.html">Only Empowerment</a>',
      '<details class="site-menu"><summary>Menu</summary><nav aria-label="Static reading navigation"><a href="/read/index.html">All readings</a>',
      '<a href="/#teaching-order">The PERIOD Code</a>',
      '<a href="/read/rebuild.html">How to Rebuild Yourself</a>',
      '<a href="/read/loop.html">The Discipline Loop</a>',
      '<a href="/read/execution.html">Pure Execution Mode</a>',
      '<a href="/read/privacy.html">Privacy &amp; source</a></nav></details></header>',
      '<main id="main" class="site-main" tabindex="-1">',
      body,
      '</main>',
      staticFooter(build, framework),
      '</body></html>',
    ].join(''),
  );

const markerAt = (text: string, marker: string) => {
  const i = text.indexOf(marker);
  if (i < 0 || text.indexOf(marker, i + 1) >= 0)
    throw new Error('Expected exactly one approved reading marker: ' + marker);
  return i;
};

// The combined document nests the lesson under an H2. Its practice starts
// at a second H2. Promote only the extracted lesson's topic hierarchy.
function standaloneLesson(html: string) {
  const practice = html.indexOf('<h2', html.indexOf('</h1>') + '</h1>'.length);
  if (practice < 0) throw new Error('Missing standalone practice heading.');
  const lesson = html
    .slice(0, practice)
    .replace(
      /<(\/?)h([34])(?=[\s>])/g,
      (_, closing: string, level: string) => '<' + closing + 'h' + (Number(level) - 1),
    );
  return lesson + html.slice(practice);
}

export function ownershipReading(build?: FooterBuild, staging = true) {
  const full = periodFallback();
  const start = markerAt(full, '<h2 id="reading-ownership">Ownership</h2>');
  const end = markerAt(full, '<section aria-label="Purpose linear reading" id="reading-purpose">');
  const reading = full
    .slice(start, end)
    .replace(
      '<h2 id="reading-ownership">Ownership</h2>',
      '<h1 id="reading-ownership">Ownership.</h1>',
    )
    .replaceAll('href="#reading-purpose"', 'href="/read/purpose.html"')
    .replaceAll('href="#why-period"', 'href="/#why-period"');
  return shell(
    'Ownership, complete text-only lesson and practice',
    '<div class="period-learning period-reading">' + standaloneLesson(reading) + '</div>',
    '/read/resilience.css',
    build,
    'period',
    staging,
  );
}

export function purposeReading(build?: FooterBuild, staging = true) {
  const reading = purposeFallback()
    .replace('<h2>Purpose.</h2>', '<h1>Purpose.</h1>')
    .replaceAll('href="#reading-ownership"', 'href="/read/ownership.html"');
  return shell(
    'Purpose, complete text-only lesson and evening comparison',
    '<div class="period-learning period-reading">' + standaloneLesson(reading) + '</div>',
    '/read/resilience.css',
    build,
    'period',
    staging,
  );
}

export function standardOnPaper(build?: FooterBuild, staging = true) {
  const full = periodFallback();
  const start = markerAt(full, '<section class="standard-paper-reading">');
  const end = markerAt(full, '<section class="no-print">');
  return shell(
    'Use the standard on paper',
    '<div class="period-learning period-reading"><h1>Use the standard on paper</h1>' +
      full.slice(start, end) +
      '</div>',
    '/read/resilience.css',
    build,
    'period',
    staging,
  );
}

export function rebuildReading(build?: FooterBuild, staging = true) {
  return shell(
    'How to Rebuild Yourself, complete text-only reading',
    '<h1 class="standalone-reading-heading">How to Rebuild Yourself: Complete reading</h1>' +
      rebuildFallback(),
    '/read/rebuild.css',
    build,
    'rebuild',
    staging,
  );
}

export function readingIndex(build?: FooterBuild, staging = true) {
  const body = [
    '<div class="period-learning period-reading"><h1>Complete text-only readings</h1>',
    '<p>Read or print the complete educational lessons without JavaScript or an account.</p>',
    '<nav aria-label="Complete reading index"><h2>The PERIOD Code</h2>',
    '<ol><li><a href="/read/ownership.html">Ownership, including practice</a></li>',
    '<li><a href="/read/purpose.html">Purpose, including the evening comparison</a></li>',
    '<li><a href="/read/resilience.html">Resilience, complete lesson and example</a></li>',
    '<li><a href="/read/integrity.html">Integrity, complete lesson and example</a></li>',
    '<li><a href="/read/discipline.html">Discipline, complete lesson and example</a></li>',
    '<li><a href="/read/empowerment.html">Empowerment, complete lesson and example</a></li></ol>',
    '<h2>How to Rebuild Yourself</h2>',
    '<p><a href="/read/rebuild.html">Read or print the complete guide and all alternatives</a>.</p>',
    '<h2>Practice on paper</h2><p><a href="/read/standard.html">Use the standard on paper</a>.</p>',
    '<h2>The Discipline Loop</h2><p><a href="/read/loop.html">Complete teaching and every outcome</a>.</p><p><a href="/read/loop-practice.html">The complete pressure-point example</a>.</p>',
    '<h2>Pure Execution Mode</h2><p><a href="/read/execution.html">Complete teaching, worked examples and explanations</a>.</p>',
    '</nav></div>',
  ].join('');
  return shell(
    'Complete text-only readings',
    body,
    '/read/resilience.css',
    build,
    'combined',
    staging,
  );
}
