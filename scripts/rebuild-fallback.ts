import { readFileSync } from 'node:fs';
// The no-script fallback includes the complete Work 53 teaching and all source
// alternatives. The Preact experience is an enhancement, never a reading gate.
export function rebuildFallback() {
  const source = readFileSync('docs/work53-source/all.html', 'utf8');
  const main = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!main) throw new Error('Work 53 complete reading lacks main content.');
  if (/<script\b|\bon\w+\s*=|\bstyle\s*=/i.test(main[1]))
    throw new Error('Work 53 no-script source failed the static-only boundary.');
  const body = main[1]
    .replace(/href="([^"]+\.html)(?:#([^"]+))?"/g, (_match, name: string, anchor?: string) => {
      const target = name.slice(0, -5);
      if (!['line', 'structure', 'return', 'trust', 'negotiation', 'help'].includes(target))
        throw new Error('Unexpected Work 53 reading link: ' + name);
      // Return to the actual example, not the chapter opening.
      return 'href="#' + target + (anchor === 'example' ? '-example' : '') + '"';
    })
    .replace(
      /<article class="all-module" id="(line|structure|return|trust|negotiation|help|end)">/g,
      (_source, id: string) =>
        '<span class="native-route-alias" id="/rebuild/' +
        id +
        '" aria-hidden="true"></span><article class="all-module" id="' +
        id +
        '">',
    );
  return (
    '<section class="rebuild-guide" id="rebuild-reading" aria-label="How to Rebuild Yourself, complete teaching">' +
    '<div class="wrap all-reading"><span class="native-route-alias" id="/rebuild" aria-hidden="true"></span>' +
    '<span class="native-route-alias" id="/rebuild/index" aria-hidden="true"></span>' +
    '<span class="native-route-alias" id="/rebuild/complete" aria-hidden="true"></span>' +
    body.replaceAll('<h1', '<h2').replaceAll('</h1>', '</h2>') +
    '</div></section>'
  );
}
