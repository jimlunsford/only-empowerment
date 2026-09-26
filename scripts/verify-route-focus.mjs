import { spawnSync } from "node:child_process";
function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run("npm", ["audit"]);
const focused =
  "hash-route navigation|immediate form interaction|Do It Now same-tab|Do It Now multi-tab|Do It Now changed bytes";
const repeated =
  "^Do It Now same-tab deletion cannot replay its own event over immediate fresh work$|^immediate form interaction retains input and focus after route navigation$";
run(
  "npx",
  [
    "playwright",
    "test",
    "--project=chromium",
    "--project=webkit",
    "--workers=1",
    "--retries=0",
    "--max-failures=1",
    "--grep",
    focused,
    "--output=test-results/focused",
    "--reporter=list,json",
  ],
  { PLAYWRIGHT_JSON_OUTPUT_NAME: "test-results/focused-summary.json" },
);
run(
  "npx",
  [
    "playwright",
    "test",
    "--project=webkit",
    "--workers=1",
    "--retries=0",
    "--max-failures=1",
    "--repeat-each=50",
    "--grep",
    repeated,
    "--output=test-results/repeated",
    "--reporter=list,json",
  ],
  { PLAYWRIGHT_JSON_OUTPUT_NAME: "test-results/repeated-summary.json" },
);
