import { assertPublicModules } from './scripts/public-boundary.ts';
import { staticFooter } from './scripts/site-footer.ts';
import { privacyReading } from './scripts/privacy-reading.ts';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { empowermentReading } from './scripts/empowerment-reading.ts';
import { disciplineReading } from './scripts/discipline-reading.ts';
import { integrityReading } from './scripts/integrity-reading.ts';
import { resilienceReading } from './scripts/resilience-reading.ts';
import { periodFallback } from './scripts/period-fallback.ts';
import { rebuildFallback } from './scripts/rebuild-fallback.ts';
import { loopFallback, loopReading } from './scripts/loop-reading.ts';
import { executionFallback, executionReading } from './scripts/execution-reading.ts';
import { frameworkChooser } from './scripts/framework-links.ts';
import { frameworkOrientation } from './src/framework-home-content.ts';
import { escapeLoop } from './scripts/loop-reading.ts';
import {
  ownershipReading,
  purposeReading,
  rebuildReading,
  readingIndex,
  standardOnPaper,
} from './scripts/standalone-reading.ts';
import { buildInfo } from './scripts/build-info.mjs';
import { releaseState } from './scripts/release-state.mjs';
// Default safely to staging; production presentation must be explicitly requested.
const presentation = process.env.OE_PRESENTATION ?? 'staging';
if (presentation !== 'staging' && presentation !== 'production')
  throw new Error('OE_PRESENTATION must be staging or production.');
const staging = presentation === 'staging';
const metadata = {
  ...(process.env.OE_RELEASE_TAG
    ? releaseState(process.env.OE_RELEASE_TAG)
    : buildInfo(process.env.OE_RELEASE_BUILD === '1')),
  presentation,
};
const rebuildStyles = () =>
  [
    'src/style.css',
    'src/period.css',
    'src/navigation.css',
    'src/rebuild-source-scoped.css',
    'src/rebuild-app.css',
    'src/site-footer.css',
  ]
    .concat('src/reading.css')
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n')
    // This script-free reader cannot realign a fragment after a late font swap.
    // Use the same Source files when ready for initial layout; otherwise keep
    // the fallback for this document. The interactive app retains font swapping.
    .replaceAll('font-display: swap;', 'font-display: optional;');
const loopStyles = () =>
  ['src/style.css', 'src/period.css', 'src/navigation.css', 'src/site-footer.css', 'src/loop.css']
    .concat('src/reading.css')
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
const executionStyles = () =>
  [
    'src/style.css',
    'src/period.css',
    'src/navigation.css',
    'src/site-footer.css',
    'src/execution.css',
  ]
    .concat('src/reading.css')
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
const resilienceStyles = () =>
  [
    'src/style.css',
    'src/period.css',
    'src/navigation.css',
    'src/period-resilience.css',
    'src/site-footer.css',
    'src/lesson-transitions.css',
  ]
    .concat('src/reading.css')
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
const integrityStyles = () =>
  [
    'src/style.css',
    'src/period.css',
    'src/period-integrity.css',
    'src/site-footer.css',
    'src/lesson-transitions.css',
  ]
    .concat('src/reading.css')
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
const empowermentStyles = () =>
  [
    'src/style.css',
    'src/period.css',
    'src/period-empowerment.css',
    'src/site-footer.css',
    'src/lesson-transitions.css',
  ]
    .concat('src/reading.css')
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
const disciplineStyles = () =>
  [
    'src/style.css',
    'src/period.css',
    'src/period-discipline.css',
    'src/site-footer.css',
    'src/lesson-transitions.css',
  ]
    .concat('src/reading.css')
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
export default defineConfig({
  define: { __BUILD__: JSON.stringify(metadata), __STAGING__: JSON.stringify(staging) },
  plugins: [
    {
      name: 'source-metadata',
      transformIndexHtml(html) {
        return html
          .replace(
            '<!-- period-fallback -->',
            '<section class="framework-hub" aria-label="Framework introduction">' +
              '<h1>Only Empowerment</h1>' +
              '<p>Explore complete educational experiences from The PERIOD Code, How to Rebuild Yourself, The Discipline Loop and Pure Execution Mode.</p>' +
              frameworkChooser() +
              '<section aria-labelledby="framework-orientation-title"><h2 id="framework-orientation-title">' +
              escapeLoop(frameworkOrientation.heading) +
              '</h2><p>' +
              escapeLoop(frameworkOrientation.relationship) +
              '</p><p>' +
              escapeLoop(frameworkOrientation.choice) +
              '</p></section>' +
              '<p><a href="#teaching-order">Explore The PERIOD Code</a> or ' +
              '<a href="/read/rebuild.html">read How to Rebuild Yourself</a> or <a href="/read/loop.html">read The Discipline Loop</a> or <a href="/read/execution.html">read Pure Execution Mode</a>.</p></section>' +
              periodFallback()
                .replace('<h1 id="home-title"', '<h2 id="home-title"')
                .replace('</h1>', '</h2>') +
              rebuildFallback() +
              loopFallback() +
              executionFallback(),
          )
          .replace('<!-- site-footer -->', staticFooter(metadata, 'combined'))
          .replace(
            'content="noindex, nofollow"',
            staging ? 'content="noindex, nofollow"' : 'content="index, follow"',
          );
      },
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const path = request.url?.split('?')[0];
          const standalone = new Map([
            ['/read/execution.html', () => executionReading(metadata, staging)],
            ['/read/execution.css', () => executionStyles()],
            ['/read/loop.html', () => loopReading(metadata, staging)],
            ['/read/loop-practice.html', () => loopReading(metadata, staging, true)],
            ['/read/loop.css', () => loopStyles()],
            ['/read/index.html', () => readingIndex(metadata, staging)],
            ['/read/ownership.html', () => ownershipReading(metadata, staging)],
            ['/read/purpose.html', () => purposeReading(metadata, staging)],
            ['/read/standard.html', () => standardOnPaper(metadata, staging)],
            ['/read/rebuild.html', () => rebuildReading(metadata, staging)],
            ['/read/rebuild.css', () => rebuildStyles()],
          ]);
          const standaloneResponse = path ? standalone.get(path) : undefined;
          if (standaloneResponse) {
            response.setHeader(
              'Content-Type',
              path?.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8',
            );
            response.end(standaloneResponse());
            return;
          }
          if (path === '/read/privacy.html' || path === '/read/privacy.css') {
            response.setHeader(
              'Content-Type',
              path.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/css; charset=utf-8',
            );
            response.end(
              path.endsWith('.html') ? privacyReading(staging, metadata) : resilienceStyles(),
            );
            return;
          }
          if (path === '/read/empowerment.html' || path === '/read/empowerment.css') {
            response.setHeader(
              'Content-Type',
              path.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/css; charset=utf-8',
            );
            response.end(
              path.endsWith('.html') ? empowermentReading(staging, metadata) : empowermentStyles(),
            );
            return;
          }
          if (path === '/read/discipline.html' || path === '/read/discipline.css') {
            response.setHeader(
              'Content-Type',
              path.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/css; charset=utf-8',
            );
            response.end(
              path.endsWith('.html') ? disciplineReading(staging, metadata) : disciplineStyles(),
            );
            return;
          }
          if (path === '/read/integrity.html' || path === '/read/integrity.css') {
            response.setHeader(
              'Content-Type',
              path.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/css; charset=utf-8',
            );
            response.end(
              path.endsWith('.html') ? integrityReading(staging, metadata) : integrityStyles(),
            );
            return;
          }
          if (path !== '/read/resilience.html' && path !== '/read/resilience.css') return next();
          response.setHeader(
            'Content-Type',
            path.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/css; charset=utf-8',
          );
          response.end(
            path.endsWith('.html') ? resilienceReading(staging, metadata) : resilienceStyles(),
          );
        });
      },
      generateBundle(_options, bundle) {
        for (const [fileName, source] of [
          ['read/execution.html', executionReading(metadata, staging)],
          ['read/execution.css', executionStyles()],
          ['read/loop.html', loopReading(metadata, staging)],
          ['read/loop-practice.html', loopReading(metadata, staging, true)],
          ['read/loop.css', loopStyles()],
          ['read/index.html', readingIndex(metadata, staging)],
          ['read/ownership.html', ownershipReading(metadata, staging)],
          ['read/purpose.html', purposeReading(metadata, staging)],
          ['read/standard.html', standardOnPaper(metadata, staging)],
          ['read/rebuild.html', rebuildReading(metadata, staging)],
          ['read/rebuild.css', rebuildStyles()],
        ])
          this.emitFile({ type: 'asset', fileName, source });
        this.emitFile({
          type: 'asset',
          fileName: 'read/privacy.html',
          source: privacyReading(staging, metadata),
        });
        this.emitFile({ type: 'asset', fileName: 'read/privacy.css', source: resilienceStyles() });
        for (const output of Object.values(bundle))
          if (output.type === 'chunk') assertPublicModules(Object.keys(output.modules));
        this.emitFile({
          type: 'asset',
          fileName: 'read/empowerment.html',
          source: empowermentReading(staging, metadata),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'read/empowerment.css',
          source: empowermentStyles(),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'read/discipline.html',
          source: disciplineReading(staging, metadata),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'read/discipline.css',
          source: disciplineStyles(),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'read/integrity.html',
          source: integrityReading(staging, metadata),
        });
        this.emitFile({ type: 'asset', fileName: 'read/integrity.css', source: integrityStyles() });
        this.emitFile({
          type: 'asset',
          fileName: 'read/resilience.html',
          source: resilienceReading(staging, metadata),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'read/resilience.css',
          source: resilienceStyles(),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: staging ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n',
        });
        this.emitFile({
          type: 'asset',
          fileName: 'THIRD_PARTY_NOTICES.txt',
          source: readFileSync('THIRD_PARTY_NOTICES.md', 'utf8'),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'build.json',
          source: JSON.stringify(metadata, null, 2) + '\n',
        });
      },
    },
  ],
  build: {
    emptyOutDir: true,
    target: ['chrome109', 'edge109', 'firefox115', 'safari16.4'],
    sourcemap: false,
  },
  server: { host: '0.0.0.0' },
});
