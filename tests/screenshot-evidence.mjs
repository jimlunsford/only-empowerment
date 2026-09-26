import { writeFile } from 'node:fs/promises';

export function isCaptureProtocolFailure(error) {
  return (
    error instanceof Error &&
    /^(?:page\.screenshot:\s*|Page\.captureScreenshot:\s*)?Protocol error \(Page\.captureScreenshot\): Unable to capture screenshot(?:\r?\n|$)/.test(
      error.message,
    )
  );
}

export async function captureEvidence(page, info, name) {
  if (!['chromium', 'mobile-chromium'].includes(info.project.name)) return;
  const requested = name + '.png';
  try {
    await page.screenshot({ path: info.outputPath(requested), fullPage: true });
    return;
  } catch (error) {
    if (!isCaptureProtocolFailure(error)) throw error;
    const evidence = {
      requested,
      project: info.project.name,
      fullPage: { status: 'failed', error: error.message },
      viewport: { status: 'pending', file: name + '-viewport-fallback.png' },
    };
    const path = info.outputPath(name + '-capture-evidence.json');
    // Persist before fallback, including when an unexpected error must remain fatal.
    await writeFile(path, JSON.stringify(evidence, null, 2) + '\n');
    let unexpected;
    let fatal = false;
    try {
      await page.screenshot({ path: info.outputPath(evidence.viewport.file), fullPage: false });
      evidence.viewport.status = 'succeeded';
    } catch (fallbackError) {
      evidence.viewport.status = 'failed';
      evidence.viewport.error = String(fallbackError?.message ?? fallbackError);
      if (!isCaptureProtocolFailure(fallbackError)) {
        fatal = true;
        unexpected = fallbackError;
      }
    }
    await writeFile(path, JSON.stringify(evidence, null, 2) + '\n');
    await info.attach(name + '-capture-evidence', { path, contentType: 'application/json' });
    info.annotations.push({
      type: 'screenshot-degraded',
      description: `${requested}: full-page failed; viewport ${evidence.viewport.status}`,
    });
    if (fatal) throw unexpected;
    // Known transport failures do not prevent the caller's product assertions.
  }
}
