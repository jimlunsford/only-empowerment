import assert from 'node:assert/strict';
export const readingNavigationScript = '<script defer src="/read/navigation.js"></script>';
// Only the exact optional navigation enhancement is allowed. Existing teaching,
// input, storage and unknown-script prohibitions still run on the remaining HTML.
export function withoutReadingNavigation(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)].map(
    ([script]) => script,
  );
  assert.ok(scripts.length <= 1, 'At most one reading navigation script');
  for (const script of scripts) assert.equal(script, readingNavigationScript);
  return html.replace(readingNavigationScript, '');
}
