import { spawn } from "node:child_process";
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

  it("executes the tool call and exits promptly without waiting on stdin", async () => {
    const child = spawn(process.execPath, [CLI_PATH, "--call", "get-server-information"], {
      // Deliberately mirror the reported repro: stdin is a pipe that is
      // never written to and never closed by us. If the CLI ever attaches
      // a stdio MCP transport, the process will hang until this test's
      // timeout kills it.
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
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

    expect(exitCode).toBe(0);
    expect(stdout).toContain("version");
  }, 25000);
});
