import test from 'node:test';
import assert from 'node:assert/strict';
import { siteNotices, staticFooter } from '../scripts/site-footer.ts';
import {
  founderCopyright,
  footerBuildNotice,
  footerEducation,
} from '../src/site-footer-content.ts';

const build = {
  version: '1.0.0-rc.3',
  commit: 'a'.repeat(40),
  source: 'https://github.com/jimlunsford/only-empowerment/commit/' + 'a'.repeat(40),
  dirty: false,
};
test('footer uses exact founder wording and separate software rights with real source metadata', () => {
  const html = staticFooter(build);
  assert.equal(html.match(/<footer/g).length, 1);
  const copyright = html
    .match(/<p class="founder-copyright">(.*?)<\/p>/)[1]
    .replace(/<[^>]*>/g, '');
  assert.equal(copyright, founderCopyright);
  assert.match(html, /href="https:\/\/jimlunsford.com\/">Jim Lunsford<\/a>/);
  assert.match(html, /href="https:\/\/phoenix233.com\/">Phoenix 2:33 LLC<\/a>/);
  assert.match(html, /AGPL-3.0-or-later/);
  assert.match(html, /No warranty/);
  assert.match(html, /does not limit these software permissions/);
  assert.ok(html.includes(build.source));
  assert.match(html, /application links above require JavaScript/);
});
test('dirty and unidentified previews never claim a base commit is exact corresponding source', () => {
  for (const metadata of [undefined, { ...build, dirty: true }]) {
    const html = siteNotices(metadata);
    assert.equal(footerBuildNotice(metadata).source, null);
    assert.ok(!html.includes('Corresponding source for this build'));
    assert.ok(!html.includes(build.source));
  }
  assert.match(siteNotices({ ...build, dirty: true }), /local changes · base aaaaaaa/);
});
test('build-time metadata is escaped and legacy attribution follows the existing tool', () => {
  const html = siteNotices({
    ...build,
    version: '<img src=x>',
    source: 'https://example.test/"<bad>',
  });
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<bad>'));
  assert.match(html, /&lt;img src=x&gt;/);
  assert.match(footerEducation('/tools/next-move').text, /Pure Execution Mode/);
  assert.match(footerEducation('/tools/reset').text, /The Discipline Loop/);
  assert.match(footerEducation('/period/standard').text, /The PERIOD Code/);
});
