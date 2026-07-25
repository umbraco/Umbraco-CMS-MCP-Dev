#!/usr/bin/env node
/**
 * Runs only the integration tests related to the current change.
 *
 * Used as a fast pre-flight in the cloud build loops (mcp-issue-loop,
 * rework-loop): each session spins up a SQLite Umbraco and validates the
 * change's own test(s) before the PR reaches CI. CI still runs the full
 * suite (npm test) — this script exists so that check doesn't require the
 * model to hand-construct a --testPathPattern.
 *
 * Flow:
 *   1. Resolve the diff base (GITHUB_BASE_REF when set, else this repo's
 *      default branch, main).
 *   2. Find changed *.ts files under src/ relative to that base.
 *   3. Run `jest --findRelatedTests` over the changed non-test source files,
 *      so dependents (e.g. a shared helper's tests) are included.
 *   4. Also run any changed *.test.ts files directly, since a change that
 *      only edits a test file has nothing for --findRelatedTests to find.
 *   5. If nothing matches, exit 0 with a clear message — this is not a
 *      failure (e.g. a docs-only change).
 *
 * These are integration tests that need a running Umbraco + API user; this
 * script only selects and runs tests, it does not start Umbraco.
 *
 * Usage:
 *   npm run test:changed
 */

import { execFileSync } from "node:child_process";

const REPO_ROOT = new URL("..", import.meta.url).pathname;

function run(command, args) {
  return execFileSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
}

/** Like run(), but streams stdout/stderr live instead of capturing it. */
function runInherit(command, args) {
  execFileSync(command, args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });
}

function refExists(ref) {
  try {
    run("git", ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve the diff base to compare HEAD against. Prefers the PR's actual
 * base branch (GITHUB_BASE_REF, set by GitHub Actions on pull_request
 * events) so the "changed files" set matches what the PR will merge. Falls
 * back to this repo's default branch, main (there is no dev branch here).
 */
function resolveDiffBase() {
  const candidates = [];
  if (process.env.GITHUB_BASE_REF) {
    candidates.push(`origin/${process.env.GITHUB_BASE_REF}`);
  }
  candidates.push("origin/main", "main");

  for (const candidate of candidates) {
    if (refExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Could not resolve a diff base — tried: ${candidates.join(", ")}. ` +
      "Is 'origin' fetched?"
  );
}

function getChangedTsFiles(diffBase) {
  const output = run("git", [
    "diff",
    "--name-only",
    "--diff-filter=ACMR",
    `${diffBase}...HEAD`,
    "--",
    "src/**/*.ts",
  ]);

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function main() {
  const diffBase = resolveDiffBase();
  console.log(`test:changed — diff base: ${diffBase}`);

  const changedFiles = getChangedTsFiles(diffBase);

  if (changedFiles.length === 0) {
    console.log(
      "test:changed — no changed .ts files under src/ vs the diff base; no related tests for this change."
    );
    process.exit(0);
  }

  console.log(`test:changed — ${changedFiles.length} changed file(s):`);
  for (const file of changedFiles) {
    console.log(`  ${file}`);
  }

  const testFiles = changedFiles.filter((file) => file.endsWith(".test.ts"));
  const sourceFiles = changedFiles.filter((file) => !file.endsWith(".test.ts"));

  const jestBin = "node_modules/jest/bin/jest.js";
  const baseJestArgs = ["--experimental-vm-modules", jestBin, "--passWithNoTests"];

  let exitCode = 0;

  if (sourceFiles.length > 0) {
    console.log(
      `\ntest:changed — running --findRelatedTests over ${sourceFiles.length} changed source file(s)...`
    );
    try {
      runInherit("node", [...baseJestArgs, "--findRelatedTests", ...sourceFiles]);
    } catch (err) {
      exitCode = err.status ?? 1;
    }
  }

  if (testFiles.length > 0) {
    console.log(
      `\ntest:changed — running ${testFiles.length} changed test file(s) directly...`
    );
    try {
      runInherit("node", [...baseJestArgs, ...testFiles]);
    } catch (err) {
      exitCode = exitCode || err.status || 1;
    }
  }

  process.exit(exitCode);
}

try {
  main();
} catch (err) {
  console.error(`test:changed — ${err.message}`);
  process.exit(1);
}
