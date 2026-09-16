import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { buildInfo } from './scripts/build-info.mjs';
const metadata = buildInfo(process.env.OE_RELEASE_BUILD === '1');
export default defineConfig({
  define: { __BUILD__: JSON.stringify(metadata) },
  plugins: [
    {
      name: 'source-metadata',
      generateBundle() {
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
  build: { target: ['chrome109', 'edge109', 'firefox115', 'safari16.4'], sourcemap: false },
  server: { host: '0.0.0.0' },
});
