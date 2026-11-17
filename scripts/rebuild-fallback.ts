import { readFileSync } from 'node:fs';

// These are fixed, source-verified Work 53 documents. Keep their teaching and
// native alternatives intact, including when the application module is blocked.
function sourceMain(file: 'all' | 'index') {
  const source = readFileSync('docs/work53-source/' + file + '.html', 'utf8');
  const main = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main || /<script\b|\bon\w+\s*=|\bstyle\s*=/i.test(main))
    throw new Error('Invalid static Work 53 reading: ' + file);
  return main;
}

const target = (route: string) => `id="/rebuild/${route}" tabindex="-1"`;
const lessons = ['line', 'structure', 'return', 'trust', 'negotiation', 'help'];

function lessonAnchors(article: string, lesson: string) {
  // The complete edition and the individual lesson share the same teaching.
  // Both addresses must land on it in a browser using only the native DOM.
  let numberedNote = 0;
  const body = article
    .replace('<h2>', `<h2 ${target('complete?section=' + lesson)}>`)
    .replace(
      `<h3 id="${lesson}-example">`,
      `<div ${target('complete?section=' + lesson + '-example')}><h3 id="${lesson}-example"><span ${target(lesson + '?section=example')}>`,
    )
    .replace('</h3>', '</span></h3></div>')
    .replace('<div class="take">', `<div class="take" ${target(lesson + '?section=apply')}>`);
  const notes =
    lesson === 'line'
      ? body.replaceAll(
          '<section class="flatstate">',
          () => `<section class="flatstate" ${target('line?section=note-' + ++numberedNote)}>`,
        )
      : body;
  return `<div ${target(lesson)}>${notes}</div>`;
}

export function rebuildFallback() {
  // The complete edition contains the order and teaching. Bring over the
  // actual starting-point chooser for copied index links, omitting it in print.
  const chooser = sourceMain('index').match(
    /<section class="module-list" id="destinations">[\s\S]*?<\/section>/,
  )?.[0];
  if (!chooser) throw new Error('Missing Work 53 starting points.');
  const nativeChooser = chooser.replace(
    'class="module-list" id="destinations"',
    `class="module-list screen-only" ${target('index?section=destinations')}`,
  );
  const body = sourceMain('all')
    .replace(
      '<section id="order-links"><h2>The rebuilding order</h2>',
      `${nativeChooser}<section id="order-links"><h2 ${target('index?section=order')}><span ${target('complete?section=order-links')}>The rebuilding order</span></h2>`,
    )
    .replace(
      /<article class="all-module" id="([a-z]+)">[\s\S]*?<\/article>/g,
      (article, lesson: string) => {
        if (!lessons.includes(lesson)) throw new Error('Unexpected rebuilding lesson: ' + lesson);
        return lessonAnchors(article, lesson);
      },
    )
    .replace('<article class="all-module">', `<article class="all-module" ${target('end')}>`)
    .replace(
      '<h2>Take one question with you</h2>',
      `<h2 ${target('end?section=paper')}><span ${target('complete?section=paper')}>Take one question with you</span></h2>`,
    )
    .replace(
      /href="([a-z]+)\.html(?:#([a-z-]+))?"/g,
      (_match, lesson: string, section?: string) => {
        if (!lessons.includes(lesson) || (section && section !== 'example'))
          throw new Error('Unexpected Work 53 reading link: ' + lesson);
        return `href="#${lesson}${section ? '-example' : ''}"`;
      },
    )
    .replaceAll('<h1', '<h2')
    .replaceAll('</h1>', '</h2>');
  return `<section class="rebuild-guide" id="rebuild-reading" aria-label="How to Rebuild Yourself, complete teaching"><div id="/rebuild" tabindex="-1"><div class="wrap all-reading" ${target('index')}><div ${target('complete')}>${body}</div></div></div></section>`;
}
