import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { captureEvidence, isCaptureProtocolFailure } from './screenshot-evidence.mjs';

const known = () =>
  new Error(
    'page.screenshot: Protocol error (Page.captureScreenshot): Unable to capture screenshot',
  );

test('capture classifier recognizes only the known screenshot protocol failure', () => {
  assert.equal(isCaptureProtocolFailure(known()), true);
  assert.equal(
    isCaptureProtocolFailure(
      new Error(
        'Page.captureScreenshot:\nProtocol error (Page.captureScreenshot): Unable to capture screenshot\nCall log:',
      ),
    ),
    true,
  );
  for (const error of [
    new Error('page.screenshot: Target page, context or browser has been closed'),
    new Error('page.screenshot: Page crashed'),
    new Error('EACCES: permission denied'),
    new Error('ENOENT: invalid output path'),
    new TypeError('Invalid screenshot options'),
    new Error('Protocol error (Page.captureScreenshot): Target closed'),
    new Error('Protocol error (Page.printToPDF): Unable to capture screenshot'),
    new Error('Unable to capture screenshot'),
    new Error('Unrelated exception mentioning ' + known().message),
    known().message,
    null,
  ])
    assert.equal(isCaptureProtocolFailure(error), false);
});

async function fixture(t, failures = [], project = 'chromium') {
  const dir = await mkdtemp(join(tmpdir(), 'oe-capture-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const calls = [];
  const attachments = [];
  const info = {
    project: { name: project },
    outputPath: (name) => join(dir, name),
    annotations: [],
    attach: async (name, options) => {
      attachments.push({
        name,
        ...options,
        evidence: JSON.parse(await readFile(options.path, 'utf8')),
      });
    },
  };
  const page = {
    screenshot: async (options) => {
      calls.push(options);
      if (failures[calls.length - 1]) throw failures[calls.length - 1];
      await writeFile(options.path, 'synthetic capture bytes');
    },
  };
  return { dir, calls, attachments, info, page };
}

test('successful full-page evidence retains its name and needs no fallback', async (t) => {
  const f = await fixture(t);
  await captureEvidence(f.page, f.info, 'action-entry-Completed');
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].fullPage, true);
  assert.deepEqual(await readdir(f.dir), ['action-entry-Completed.png']);
  assert.equal(f.attachments.length, 0);
});

test('recognized failure produces distinct viewport evidence and permits continuation', async (t) => {
  const f = await fixture(t, [known()], 'mobile-chromium');
  await captureEvidence(f.page, f.info, 'action-entry-Completed');
  assert.deepEqual(
    f.calls.map((c) => c.fullPage),
    [true, false],
  );
  const e = f.attachments[0].evidence;
  assert.equal(e.project, 'mobile-chromium');
  assert.equal(e.requested, 'action-entry-Completed.png');
  assert.equal(e.fullPage.error, known().message);
  assert.equal(e.viewport.status, 'succeeded');
  assert.equal(e.viewport.file, 'action-entry-Completed-viewport-fallback.png');
  assert.equal(await readFile(join(f.dir, e.viewport.file), 'utf8'), 'synthetic capture bytes');
  assert.equal(f.info.annotations[0].type, 'screenshot-degraded');
});

test('two known failures preserve both errors and permit functional continuation', async (t) => {
  const f = await fixture(t, [known(), known()]);
  let continued = false;
  await captureEvidence(f.page, f.info, 'action-review');
  continued = true;
  assert.equal(continued, true);
  assert.equal(f.calls.length, 2);
  assert.equal(f.attachments[0].evidence.fullPage.error, known().message);
  assert.equal(f.attachments[0].evidence.viewport.error, known().message);
  assert.equal(f.attachments[0].evidence.viewport.status, 'failed');
  assert.deepEqual(await readdir(f.dir), ['action-review-capture-evidence.json']);
});

test('unexpected initial error is fatal without a fallback', async (t) => {
  const error = new Error('page.screenshot: Page crashed');
  const f = await fixture(t, [error]);
  await assert.rejects(captureEvidence(f.page, f.info, 'action-review'), (e) => e === error);
  assert.equal(f.calls.length, 1);
});

test('unexpected fallback error is recorded and remains fatal', async (t) => {
  const error = new Error('EACCES: permission denied');
  const f = await fixture(t, [known(), error]);
  await assert.rejects(captureEvidence(f.page, f.info, 'action-review'), (e) => e === error);
  assert.equal(f.attachments[0].evidence.viewport.error, error.message);
  assert.equal(f.attachments[0].evidence.viewport.status, 'failed');
});

test('evidence attachment failures remain fatal', async (t) => {
  const f = await fixture(t, [known()]);
  f.info.attach = async () => {
    throw new Error('attachment filesystem failure');
  };
  await assert.rejects(captureEvidence(f.page, f.info, 'action-review'), /attachment filesystem/);
});

test('other browser projects retain the existing no-review-capture behavior', async (t) => {
  const f = await fixture(t, [], 'webkit');
  await captureEvidence(f.page, f.info, 'action-review');
  assert.equal(f.calls.length, 0);
});
