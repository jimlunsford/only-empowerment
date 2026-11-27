import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Pin the complete approved workflow: one unit/build job and four browser shards.
// Any later workflow edit must receive its own preservation review.
export const approvedCiWorkflowSha256 =
  '90adccef3c9f1cfe5532441e4558c5c7dedbd28889718d92316f26bf8bffd3bc';
export function assertApprovedCiWorkflow(source) {
  assert.equal(
    createHash('sha256').update(source).digest('hex'),
    approvedCiWorkflowSha256,
    '.github/workflows/ci.yml',
  );
}
