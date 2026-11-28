import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Pin the approved tiered workflow: Chromium PR/main gates and full manual/weekly/tag runs.
// One unit/build job and four browser shards retain all checks in their selected tier.
// Any later workflow edit must receive its own preservation review.
export const approvedCiWorkflowSha256 =
  'b356e28725406471ab9273a11474142cc854fb3e2ed4abb19448991f9ae2bac8';
export function assertApprovedCiWorkflow(source) {
  assert.equal(
    createHash('sha256').update(source).digest('hex'),
    approvedCiWorkflowSha256,
    '.github/workflows/ci.yml',
  );
}
