import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { buildInfo } from './scripts/build-info.mjs';
// Default safely to staging; production presentation must be explicitly requested.
const presentation = process.env.OE_PRESENTATION ?? 'staging';
if (presentation !== 'staging' && presentation !== 'production')
  throw new Error('OE_PRESENTATION must be staging or production.');
const staging = presentation === 'staging';
const metadata = { ...buildInfo(process.env.OE_RELEASE_BUILD === '1'), presentation };
export default defineConfig({
  define: { __BUILD__: JSON.stringify(metadata), __STAGING__: JSON.stringify(staging) },
  plugins: [
    {
      name: 'source-metadata',
      transformIndexHtml(html) {
        return html
          .replace(
            'content="noindex, nofollow"',
            staging ? 'content="noindex, nofollow"' : 'content="index, follow"',
          )
          .replace(
            '<!-- presentation-status -->',
            staging ? '<p>Development staging. Not a production release.</p>' : '',
          );
      },
      generateBundle() {
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
