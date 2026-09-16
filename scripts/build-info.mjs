import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
export function buildInfo(strict = false) {
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const commit = git('rev-parse', 'HEAD');
  const dirty = Boolean(git('status', '--porcelain'));
  if (strict && dirty) throw new Error('Deployable builds require a clean Git checkout.');
  const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
  let tag = null;
  try { tag = git('describe', '--tags', '--exact-match', 'HEAD'); } catch { /* Untagged staging builds are expected. */ }
  return { version, commit, dirty, tag, source: `https://github.com/jimlunsford/only-empowerment/commit/${commit}` };
}
