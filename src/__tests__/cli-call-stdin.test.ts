import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Regression test for #424: invoking the CLI with `--call` while stdin is
// left open/piped (e.g. `execFileSync(node, [cliPath, '--call', tool, ...])`
// without `stdio: ['ignore', ...]`) used to race the one-shot `--call`
// handler against the normal server bootstrap. `handleCliCommands` was
// called without an `await` in src/index.ts, so `main()` could reach
// `StdioServerTransport`/`server.connect()` — attaching a stdin listener —
// before the (async) tool call had a chance to run `process.exit()`. A
// caller that never writes to or closes stdin then hangs forever waiting
// for MCP protocol input instead of getting its `--call` result.
describe("CLI --call with piped/open stdin", () => {
  const CLI_PATH = path.resolve(process.cwd(), "dist/index.js");
  const SRC_PATH = path.resolve(process.cwd(), "src/index.ts");

  beforeAll(() => {
    // This test spawns the built bundle, not source-through-ts-jest like the
    // rest of the suite. `npm test` alone doesn't build (only `npm run
    // test:all` does), so a stale or missing dist/index.js would otherwise
    // let this test silently pass against old behaviour or fail with a
    // confusing ENOENT/non-zero-exit unrelated to the current source.
    if (!fs.existsSync(CLI_PATH)) {
      throw new Error(`${CLI_PATH} is missing — run \`npm run build\` before this test.`);
    }
    if (fs.statSync(CLI_PATH).mtimeMs < fs.statSync(SRC_PATH).mtimeMs) {
      throw new Error(
        `${CLI_PATH} is older than ${SRC_PATH} — run \`npm run build\` before this test.`,
      );
    }
  });

  // Shared by both tests below: spawn the CLI, collect stdout/stderr, and
  // resolve once it exits (or reject on a timeout/hang).
  async function spawnCli(args: string[], env: NodeJS.ProcessEnv) {
    const child = spawn(process.execPath, [CLI_PATH, ...args], {
      // Deliberately mirror the #424 repro: stdin is a pipe that is never
      // written to and never closed by us. If the CLI ever attaches a stdio
      // MCP transport, the process will hang until this test's timeout kills
      // it.
      stdio: ["pipe", "pipe", "pipe"],
      env,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));

    const exitCode = await new Promise<number | null>((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.kill("SIGKILL");
        reject(
          new Error(
            `CLI did not exit within the timeout (likely hung waiting on stdin). stdout=${stdout} stderr=${stderr}`,
          ),
        );
      }, 20000);

      child.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
      child.on("exit", (code) => {
        clearTimeout(timeout);
        resolve(code);
      });
    });

    return { stdout, stderr, exitCode };
  }

  it("executes the tool call and exits promptly without waiting on stdin", async () => {
    const { stdout, stderr, exitCode } = await spawnCli(["--call", "get-server-information"], process.env);

    if (exitCode !== 0) {
      throw new Error(`CLI exited with code ${exitCode} (expected 0). stdout=${stdout} stderr=${stderr}`);
    }
    expect(stdout).toContain("version");
  }, 25000);

  // Regression test for the PR #540 review: a major-version mismatch must
  // *warn*, never *block*, on the `--call` path. See the long comment in
  // src/index.ts above the `checkUmbracoVersion`/`configureVersionCheckHook`
  // ordering for why the hook must only be configured after
  // `handleCliCommands` runs. This spawns the real built CLI against the
  // live Umbraco instance (unlike cli-version-check-ordering.test.ts, which
  // mocks the SDK boundary), so it exercises the actual pre-execution check
  // the MCP SDK applies to `tool.handler()`, not a model of it.
  it("warns on a major-version mismatch but still runs --call and exits 0", async () => {
    // "0" rather than `UMBRACO_TARGET_MAJOR + 1`: no real Umbraco instance
    // will ever report major 0, so this is a mismatch regardless of which
    // major the live test instance happens to be on (unlike +1, which would
    // falsely match if the instance were already a major ahead of the
    // client's generated target).
    const mismatchedMajor = "0";
    const { stdout, stderr, exitCode } = await spawnCli(["--call", "get-server-information"], {
      ...process.env,
      UMBRACO_EXPECTED_MAJOR: mismatchedMajor,
    });

    if (exitCode !== 0) {
      throw new Error(`CLI exited with code ${exitCode} (expected 0). stdout=${stdout} stderr=${stderr}`);
    }
    // Asserts the exact target major, not just the generic warning prefix:
    // loadServerConfig() reloads .env with `override: true` *after* this
    // process's env is set, so a developer's own .env defining
    // UMBRACO_EXPECTED_MAJOR would otherwise silently replace the major this
    // test asked for. This fails loudly (wrong major in the message) instead
    // of passing against an unintended value.
    expect(stderr).toContain(`targets Umbraco ${mismatchedMajor}.x`);
    expect(() => JSON.parse(stdout)).not.toThrow();
  }, 25000);
});
