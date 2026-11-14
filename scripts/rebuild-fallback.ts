import { readFileSync } from 'node:fs';
// The no-script fallback includes the complete Work 53 teaching and all source
// alternatives. The Preact experience is an enhancement, never a reading gate.
export function rebuildFallback() {
  const source = readFileSync('docs/work53-source/all.html', 'utf8');
  const main = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!main) throw new Error('Work 53 complete reading lacks main content.');
  if (/<script\b|\bon\w+\s*=|\bstyle\s*=/i.test(main[1]))
    throw new Error('Work 53 no-script source failed the static-only boundary.');
  const body = main[1].replace(/href="([^"]+\.html)(?:#[^"]+)?"/g, (_match, name: string) => {
    const target = name.slice(0, -5);
    if (!['line', 'structure', 'return', 'trust', 'negotiation', 'help'].includes(target))
      throw new Error('Unexpected Work 53 reading link: ' + name);
    return 'href="#' + target + '"';
  });
  return (
    '<section class="rebuild-guide" id="rebuild-reading" aria-label="How to Rebuild Yourself, complete teaching">' +
    '<div class="wrap all-reading">' +
    body +
    '</div></section>'
  );
}
