import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { disciplineReading } from './scripts/discipline-reading.ts';
import { integrityReading } from './scripts/integrity-reading.ts';
import { resilienceReading } from './scripts/resilience-reading.ts';
import { periodFallback } from './scripts/period-fallback.ts';
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
const resilienceStyles = () =>
  ['src/style.css', 'src/period.css', 'src/period-resilience.css']
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
const integrityStyles = () =>
  ['src/style.css', 'src/period.css', 'src/period-integrity.css']
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
const disciplineStyles = () =>
  ['src/style.css', 'src/period.css', 'src/period-discipline.css']
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
export default defineConfig({
  define: { __BUILD__: JSON.stringify(metadata), __STAGING__: JSON.stringify(staging) },
  plugins: [
    {
      name: 'source-metadata',
      transformIndexHtml(html) {
        return html
          .replace('<!-- period-fallback -->', periodFallback())
          .replace(
            'content="noindex, nofollow"',
            staging ? 'content="noindex, nofollow"' : 'content="index, follow"',
          )
          .replace(
            '<!-- presentation-status -->',
            staging ? '<p>Development staging. Not a production release.</p>' : '',
          );
      },
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const path = request.url?.split('?')[0];
          if (path === '/read/discipline.html' || path === '/read/discipline.css') {
            response.setHeader(
              'Content-Type',
              path.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/css; charset=utf-8',
            );
            response.end(path.endsWith('.html') ? disciplineReading(staging) : disciplineStyles());
            return;
          }
          if (path === '/read/integrity.html' || path === '/read/integrity.css') {
            response.setHeader(
              'Content-Type',
              path.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/css; charset=utf-8',
            );
            response.end(path.endsWith('.html') ? integrityReading(staging) : integrityStyles());
            return;
          }
          if (path !== '/read/resilience.html' && path !== '/read/resilience.css') return next();
          response.setHeader(
            'Content-Type',
            path.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/css; charset=utf-8',
          );
          response.end(path.endsWith('.html') ? resilienceReading(staging) : resilienceStyles());
        });
      },
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'read/discipline.html',
          source: disciplineReading(staging),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'read/discipline.css',
          source: disciplineStyles(),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'read/integrity.html',
          source: integrityReading(staging),
        });
        this.emitFile({ type: 'asset', fileName: 'read/integrity.css', source: integrityStyles() });
        this.emitFile({
          type: 'asset',
          fileName: 'read/resilience.html',
          source: resilienceReading(staging),
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
