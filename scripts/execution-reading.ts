import { executionTeaching, type ExecutionNode } from '../src/execution-view.ts';
import { staticFooter } from './site-footer.ts';
import type { FooterBuild } from '../src/site-footer-content.ts';

export const escapeExecution = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
export function renderExecutionHtml(node: ExecutionNode): string {
  if (typeof node === 'string') return escapeExecution(node);
  const attrs = Object.entries(node.attrs)
    .map(([key, value]) => ` ${key.toLowerCase()}="${escapeExecution(String(value))}"`)
    .join('');
  return `<${node.tag}${attrs}>${node.children.map(renderExecutionHtml).join('')}</${node.tag}>`;
}
export const executionFallback = () => renderExecutionHtml(executionTeaching('root'));
export function executionReading(build?: FooterBuild, staging = true): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="${staging ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>Pure Execution Mode | Only Empowerment</title><link rel="stylesheet" href="/read/execution.css"></head><body class="site-shell native-execution"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/read/index.html">Only Empowerment</a><nav aria-label="Reading navigation"><a href="/read/index.html">All readings</a><a href="/#/execution">Pure Execution Mode with optional explanations</a><a href="/read/privacy.html">Privacy &amp; source</a></nav></header><main id="main" class="site-main" tabindex="-1"><p class="execution-reading-note">Complete reading edition. Every hint and explanation is visible. Use your browser's Print command for paper or PDF. No scripts or answers are required.</p>${renderExecutionHtml(executionTeaching('reading'))}</main>${staticFooter(build, 'execution')}</body></html>`;
}
