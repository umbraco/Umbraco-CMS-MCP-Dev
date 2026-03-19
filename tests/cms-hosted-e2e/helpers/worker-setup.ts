/**
 * Worker lifecycle for CMS MCP E2E tests.
 *
 * Starts and stops the Worker using Wrangler's unstable_dev.
 */

import { unstable_dev, type Unstable_DevWorker } from "wrangler";
import { execSync } from "node:child_process";

let worker: Unstable_DevWorker | undefined;
let workerUrl: string | undefined;

const BASE_VARS = {
  UMBRACO_BASE_URL: "https://localhost:44391",
  UMBRACO_SERVER_URL: "http://localhost:56472",
  UMBRACO_OAUTH_CLIENT_ID: "umbraco-mcp-cms-hosted",
  COOKIE_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  ENABLE_INFO_ENDPOINT: "true",
  NODE_TLS_REJECT_UNAUTHORIZED: "0",
};

function killPortIfBusy(port: number): void {
  try {
    const output = execSync(`lsof -ti :${port}`, { encoding: "utf8" }).trim();
    if (output) {
      for (const pid of output.split("\n")) {
        try { process.kill(Number(pid), "SIGKILL"); } catch { /* ignore */ }
      }
      // Brief wait for port to free
      execSync("sleep 1");
    }
  } catch { /* no process on port — fine */ }
}

export async function startWorker(varsOverride?: Record<string, string>): Promise<string> {
  killPortIfBusy(8787);

  worker = await unstable_dev("tests/cms-hosted-e2e/worker.ts", {
    config: "tests/cms-hosted-e2e/wrangler.e2e.toml",
    port: 8787,
    experimental: { disableExperimentalWarning: true },
    vars: { ...BASE_VARS, ...varsOverride },
    logLevel: "error",
  });

  const address = worker.address;
  const port = worker.port;
  workerUrl = `http://${address}:${port}`;
  return workerUrl;
}

export async function stopWorker(): Promise<void> {
  if (worker) {
    await worker.stop();
    worker = undefined;
    workerUrl = undefined;
  }
}

export function getWorkerUrl(): string {
  if (!workerUrl) {
    throw new Error("Worker not started. Call startWorker() first.");
  }
  return workerUrl;
}
