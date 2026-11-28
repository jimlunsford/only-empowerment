import { withoutReadingNavigation } from './reading-navigation-contract.mjs';
import { beforeAuditBSource } from './audit-b-preservation.mjs';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import bookLinkChanges from './fixtures/book-links-changes.json' with { type: 'json' };
import { beforeBookLinksSource } from './book-links-preservation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { staticFooter } from '../scripts/site-footer.ts';
import { privacyReading } from '../scripts/privacy-reading.ts';
import { founderCopyright, footerBuildNotice } from '../src/site-footer-content.ts';
const build = {
  version: '1.0.0-rc.3',
  commit: 'a'.repeat(40),
  source: 'https://github.com/jimlunsford/only-empowerment/commit/' + 'a'.repeat(40),
  dirty: false,
};
test('footer keeps exact founder links and separates app links from script-free legal access', () => {
  const html = staticFooter(build);
  assert.equal(html.match(/<footer/g).length, 1);
  assert.equal(
    html.match(/<p class="founder-copyright">(.*?)<\/p>/)[1].replace(/<[^>]*>/g, ''),
    founderCopyright,
  );
  assert.match(html, /href="https:\/\/jimlunsford.com\/">Jim Lunsford<\/a>/);
  assert.match(html, /href="https:\/\/phoenix233.com\/">Phoenix 2:33 LLC<\/a>/);
  assert.match(html, /href="\/read\/privacy.html">Privacy &amp; source/);
  assert.match(html, /aria-label="Your practice"/);
  assert.match(html, /href="\/#\/period\/standard">Optional Standard Card/);
  assert.match(html, /Optional Standard Card requires JavaScript/);
  assert.doesNotMatch(
    html,
    /footer-meta|footer-software|footer-education|Application software:|Existing work|#\/tools|#\/saved|#\/approach/,
  );
});
test('script-free Privacy preserves exact source, license, no warranty, checksums and security in both modes', () => {
  for (const staging of [true, false]) {
    const html = privacyReading(staging, build);
    assert.ok(html.includes(build.source));
    assert.match(html, /href="\/LICENSE.txt">AGPL-3.0-or-later/);
    assert.match(html, /No warranty/);
    assert.match(html, /does not limit these software permissions/);
    assert.match(html, /href="\/SHA256SUMS"/);
    assert.match(
      html,
      /default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'/,
    );
    assert.ok(html.includes(staging ? 'noindex, nofollow' : 'index, follow'));
    assert.doesNotMatch(
      withoutReadingNavigation(html),
      /<script|Internal review|Not a production release|The footer links/,
    );
  }
});
test('dirty or unidentified previews cannot claim an exact published source; metadata is escaped', () => {
  for (const metadata of [undefined, { ...build, dirty: true }]) {
    const html = privacyReading(true, metadata);
    assert.equal(footerBuildNotice(metadata).source, null);
    assert.ok(!html.includes(build.source));
    assert.ok(!html.includes('Corresponding source for this build'));
  }
  const html = privacyReading(true, { ...build, source: 'https://example.test/"<bad>' });
  assert.ok(!html.includes('<bad>'));
  assert.ok(html.includes('&quot;&lt;bad&gt;'));
});

test('Books footer uses the canonical catalog URL and safe new-tab attributes', () => {
  assert.match(
    staticFooter(),
    /<a href="https:\/\/jimlunsford.com\/books\/" target="_blank" rel="noopener noreferrer">Books \(new tab\)<\/a>/,
  );
  assert.doesNotMatch(staticFooter(), /About The PERIOD Code book/);
});

test('book-link preservation pins every changed source and rejects incidental edits', () => {
  for (const [path, change] of Object.entries(bookLinkChanges)) {
    const source = beforeAuditBSource(readFileSync(path, 'utf8'), path);
    const original = execFileSync(
      'git',
      ['show', '46918ff1b305aa26e96f8cc0e2c241a073dbef32:' + path],
      { encoding: 'utf8' },
    );
    assert.equal(createHash('sha256').update(source).digest('hex'), change.afterSha256, path);
    assert.equal(beforeBookLinksSource(source, path), original, path);
    for (const altered of [
      source + '\n',
      source.replace('amazon', 'unexpected').replace('Books (new tab)', 'Unexpected link'),
    ]) {
      if (altered !== source) assert.notEqual(beforeBookLinksSource(altered, path), original, path);
    }
  }
});
