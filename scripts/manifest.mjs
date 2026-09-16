import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}
const lines = files('dist')
  .filter((f) => !f.endsWith('SHA256SUMS'))
  .sort()
  .map(
    (f) => `${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${relative('dist', f)}`,
  );
writeFileSync('dist/SHA256SUMS', lines.join('\n') + '\n');
console.log(`Wrote checksums for ${lines.length} build files.`);
