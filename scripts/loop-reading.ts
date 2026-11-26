import { withDesktopNavigation } from './site-menu.ts';
import { loopTeaching, loopTranscript, type LoopNode } from '../src/loop-view.ts';
import { loopScenario } from '../src/loop-practice-content.ts';
import { staticFooter } from './site-footer.ts';
import type { FooterBuild } from '../src/site-footer-content.ts';

export const escapeLoop = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
export function renderLoopHtml(node: LoopNode): string {
  if (typeof node === 'string') return escapeLoop(node);
  const attrs = Object.entries(node.attrs)
    .map(([k, v]) => ` ${k.toLowerCase()}="${escapeLoop(String(v))}"`)
    .join('');
  return `<${node.tag}${attrs}>${node.children.map(renderLoopHtml).join('')}</${node.tag}>`;
}
export function loopFallback(): string {
  return (
    renderLoopHtml(loopTeaching('root')) +
    '<div class="loop-experience">' +
    renderLoopHtml(loopTranscript('root')) +
    '</div>'
  );
}
export function loopReading(build?: FooterBuild, staging = true, practice = false): string {
  const title = practice ? loopScenario.title : 'The Discipline Loop';
  const body = practice
    ? `<div class="loop-experience"><h1>${escapeLoop(title)}</h1><p>By Jim Lunsford · The Discipline Loop</p>${renderLoopHtml(loopTranscript())}</div>`
    : renderLoopHtml(loopTeaching('reading')) +
      '<div class="loop-experience">' +
      renderLoopHtml(loopTranscript()) +
      '</div>';
  return withDesktopNavigation(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>${escapeLoop(title)} | Only Empowerment</title><link rel="stylesheet" href="/read/loop.css"></head><body class="site-shell native-loop"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/read/index.html">Only Empowerment</a><details class="site-menu"><summary>Menu</summary><nav aria-label="Reading navigation"><a href="/read/index.html">All readings</a><a href="/read/loop.html">Complete teaching</a><a href="/read/loop-practice.html">Every outcome</a><a href="/#/loop">Interactive experience</a></nav></details></header><main id="main" class="site-main" tabindex="-1"><p class="loop-reading-note">Complete reading edition. Use your browser's Print command for paper or PDF. No scripts or answers are required.</p>${body}</main>${staticFooter(build, 'loop')}</body></html>`,
  );
}
