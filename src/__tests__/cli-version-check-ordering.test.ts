import { jest } from "@jest/globals";
import { UMBRACO_TARGET_MAJOR } from "../config/umbraco-target.generated.js";

// Derive a version that matches UMBRACO_TARGET_MAJOR, and one that doesn't,
// instead of hardcoding both sides — the generated target major changes
// whenever `npm run generate` is re-run against a newer Umbraco instance.
const MATCHING_VERSION = `${UMBRACO_TARGET_MAJOR}.0.0`;
const MISMATCHED_VERSION = `${Number(UMBRACO_TARGET_MAJOR) + 1}.0.0`;

// Regression test for #426 / the PR #540 review: the Umbraco major-mismatch
// version check must *warn*, never *block*, on the `--call` and introspection
// CLI paths — only the live MCP stdio path may have a mismatch gate its next
// tool call.
//
// `configureVersionCheckHook()` registers a pre-execution hook that every
// tool (wrapped by the SDK's `withPreExecutionCheck`) consults before running
// its real handler: if the hook reports `blocked`, the tool returns an
// `isError` result instead of running at all. `handleCliCommands`'s `--call`
// branch invokes `tool.handler()` directly and turns an `isError` result into
// a non-zero exit — so if the hook is configured *before* `handleCliCommands`
// runs, a major mismatch silently turns `--call` from "warn" into "refuse"
// (each `--call` is a fresh process, so retrying never gets past it).
//
// This test models that real control flow (the version-check service's
// blocked/message state, the pre-execution hook, and the handler-gating it
// drives) faithfully rather than stubbing it out as inert jest.fn()s, so it
// actually fails if the ordering regresses — unlike the previous version of
// this test, which only asserted call order against mocks with no behaviour.
//
// This deliberately reimplements that slice of the SDK rather than importing
// it for real: an earlier version of this file spread the actual
// `@umbraco-cms/mcp-server-sdk` module's exports (to reuse its real
// `versionCheckService` singleton and `withPreExecutionCheck`) alongside
// per-test `jest.unstable_mockModule` overrides, dynamically importing the
// real module once per test. Under this project's Jest ESM setup
// (--experimental-vm-modules), `jest.resetModules()` did not reliably give
// each test its own fresh module instance for that combination — later tests
// observed another test's stale mocked `handleCliCommands`/singleton state
// instead of their own, a real (if subtle) source of flakiness, not just a
// style concern. The hand-rolled model below has no such cross-test aliasing
// risk, at the cost of needing to stay faithful to the real SDK by hand.
describe("CLI version-check ordering (regression for #426 / PR #540 review)", () => {
  const realExit = process.exit;
  const originalExpectedMajorEnv = process.env.UMBRACO_EXPECTED_MAJOR;

  beforeEach(() => {
    // A real UMBRACO_EXPECTED_MAJOR in the test process's environment (e.g.
    // from .env) would override UMBRACO_TARGET_MAJOR and silently change
    // what MATCHING_VERSION/MISMATCHED_VERSION actually mean to src/index.ts.
    delete process.env.UMBRACO_EXPECTED_MAJOR;
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    process.exit = realExit;
    if (originalExpectedMajorEnv === undefined) {
      delete process.env.UMBRACO_EXPECTED_MAJOR;
    } else {
      process.env.UMBRACO_EXPECTED_MAJOR = originalExpectedMajorEnv;
    }
  });

  // Mirrors `VersionCheckService` + `checkUmbracoVersion` + `withPreExecutionCheck`
  // from `@umbraco-cms/mcp-server-sdk` closely enough to exercise the same
  // blocking behaviour, without depending on a live Umbraco instance.
  function createVersionCheckState() {
    let blocked = false;
    let message: string | null = null;
    let preExecutionHook: (() => { blocked: boolean; message?: string; clearAfterUse?: () => void } | undefined) | null = null;

    const checkUmbracoVersion = jest.fn(
      async (options: { expectedUmbracoMajor: string; client: { getServerInformation: () => Promise<{ version: string }> } }) => {
        try {
          const info = await options.client.getServerInformation();
          const actualMajor = info.version.split(".")[0];
          if (actualMajor === options.expectedUmbracoMajor) {
            message = null;
            blocked = false;
            return;
          }
          message = `⚠️ Version Mismatch: Connected to Umbraco ${actualMajor}.x, but this server targets Umbraco ${options.expectedUmbracoMajor}.x`;
          blocked = true;
          console.error(message);
        } catch (error) {
          message = `⚠️ Unable to verify Umbraco version compatibility: ${error instanceof Error ? error.message : "Unknown error"}`;
          blocked = false;
          console.error(message);
        }
      },
    );

    const configureVersionCheckHook = jest.fn(() => {
      preExecutionHook = () =>
        blocked ? { blocked: true, message: message ?? undefined, clearAfterUse: () => { blocked = false; } } : undefined;
    });

    const getVersionCheckMessage = jest.fn(() => message);

    // Mirrors the real `withPreExecutionCheck`: consult the hook (if one has
    // been configured) before running the real handler, and self-clear once
    // consumed — a block is a one-time speed bump, not a persistent one.
    const callTool = async (handler: () => Promise<unknown>) => {
      if (preExecutionHook) {
        const result = preExecutionHook();
        if (result?.blocked) {
          result.clearAfterUse?.();
          return { isError: true as const, value: undefined, message: result.message };
        }
      }
      return { isError: false as const, value: await handler(), message: undefined };
    };

    // Mirrors handleCliCommands's `--call` branch: run the tool through the
    // hook gate above, then either short-circuit with the blocked message
    // (exit 1, like a real `isError` tool result) or print the real result
    // (exit 0).
    const runCall = async (handler: () => Promise<unknown>) => {
      const result = await callTool(handler);
      if (result.isError) {
        console.log(JSON.stringify({ error: result.message }));
        process.exit(1);
        return;
      }
      console.log(JSON.stringify(result.value));
      process.exit(0);
    };

    return { checkUmbracoVersion, configureVersionCheckHook, getVersionCheckMessage, callTool, runCall };
  }

  function mockModules(state: ReturnType<typeof createVersionCheckState>, handleCliCommands: ReturnType<typeof jest.fn>) {
    class FakeTransport {}
    class FakeServer {
      constructor(..._args: unknown[]) {}
      async connect(..._args: unknown[]) {}
    }

    jest.unstable_mockModule("@modelcontextprotocol/sdk/server/mcp.js", () => ({ McpServer: FakeServer }));
    jest.unstable_mockModule("@modelcontextprotocol/sdk/server/stdio.js", () => ({ StdioServerTransport: FakeTransport }));
    jest.unstable_mockModule("@umbraco-cms/mcp-server-sdk", () => ({
      checkUmbracoVersion: state.checkUmbracoVersion,
      configureVersionCheckHook: state.configureVersionCheckHook,
      getVersionCheckMessage: state.getVersionCheckMessage,
      configureApiClient: jest.fn(),
      initializeUmbracoFetch: jest.fn(),
      getServerConfig: jest.fn(async () => ({ cliFlags: { callTool: "get-server-information" } })),
      handleCliCommands,
      createCollectionConfigLoader: jest.fn(() => ({ loadFromConfig: () => ({}) })),
    }));
    jest.unstable_mockModule("../config/index.js", () => ({
      loadServerConfig: jest.fn(async () => ({ umbraco: { auth: {} } })),
      clearConfigCache: jest.fn(),
      allModes: {},
      allModeNames: [],
      allSliceNames: [],
    }));
    jest.unstable_mockModule("../umbraco-api/tools/collection-registry.js", () => ({ availableCollections: [] }));
    jest.unstable_mockModule("../umbraco-api/tools/tool-factory.js", () => ({ UmbracoToolFactory: jest.fn() }));
    jest.unstable_mockModule("../umbraco-api/runtime-context.js", () => ({
      setUmbracoVersion: jest.fn(),
      setAllowFilePathUploads: jest.fn(),
    }));

    // Safety net: if any mock above is incomplete, main()'s catch handler
    // calls the real process.exit(1), which would kill the Jest worker.
    process.exit = ((code?: number) => {
      throw new Error(`process.exit(${code}) called during test`);
    }) as never;
  }

  function mockClient(getServerInformation: () => Promise<{ version: string }>) {
    jest.unstable_mockModule("@umb-management-client", () => ({
      UmbracoManagementClient: {
        getClient: () => ({
          getUserCurrent: async () => ({}),
          getServerInformation,
        }),
      },
    }));
  }

  it("warns on a major mismatch but still lets --call run the tool and exit 0", async () => {
    const state = createVersionCheckState();
    const toolResult = { version: MISMATCHED_VERSION };

    const handleCliCommands = jest.fn(async () => {
      await state.runCall(async () => toolResult);
    });

    mockModules(state, handleCliCommands);
    mockClient(async () => ({ version: MISMATCHED_VERSION }));

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const exitSpy = jest.fn();
    process.exit = exitSpy as never;

    await import("../index.js");
    await new Promise((resolve) => setTimeout(resolve, 50));

    // The mismatch warning went to stderr...
    expect(errorSpy.mock.calls.some((call) => String(call[0]).includes("⚠️ Version Mismatch"))).toBe(true);
    // ...but the hook was never configured before handleCliCommands ran, so
    // the --call branch executed the real handler and printed its result.
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify(toolResult));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("does not block --call when the server's version matches", async () => {
    const state = createVersionCheckState();
    const toolResult = { version: MATCHING_VERSION };

    const handleCliCommands = jest.fn(async () => {
      await state.runCall(async () => toolResult);
    });

    mockModules(state, handleCliCommands);
    mockClient(async () => ({ version: MATCHING_VERSION }));

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const exitSpy = jest.fn();
    process.exit = exitSpy as never;

    await import("../index.js");
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(logSpy).toHaveBeenCalledWith(JSON.stringify(toolResult));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("does not crash the CLI when fetching server information fails, and still runs --list-tools", async () => {
    const state = createVersionCheckState();

    const handleCliCommands = jest.fn(async () => {
      console.log("tool table");
      process.exit(0);
    });

    mockModules(state, handleCliCommands);
    mockClient(async () => {
      throw new Error("getaddrinfo ENOTFOUND umbraco.example");
    });

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const exitSpy = jest.fn();
    process.exit = exitSpy as never;

    await import("../index.js");
    await new Promise((resolve) => setTimeout(resolve, 50));

    // checkUmbracoVersion's own try/catch handled the failure (logged to
    // stderr)...
    expect(errorSpy.mock.calls.some((call) => String(call[0]).includes("Unable to verify Umbraco version compatibility"))).toBe(true);
    // ...instead of throwing out of main() and killing every CLI command:
    // handleCliCommands (here, standing in for the real --list-tools branch)
    // still ran and exited cleanly.
    expect(handleCliCommands).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("tool table");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("only blocks once: a mismatch warns the next tool call, then clears itself", async () => {
    // Exercises configureVersionCheckHook()'s "one-time speed bump" contract
    // in isolation: the first call after a mismatch is blocked, and clears
    // the block so the following call runs the real handler.
    jest.spyOn(console, "error").mockImplementation(() => {});
    const state = createVersionCheckState();
    await state.checkUmbracoVersion({
      expectedUmbracoMajor: UMBRACO_TARGET_MAJOR,
      client: { getServerInformation: async () => ({ version: MISMATCHED_VERSION }) },
    });
    state.configureVersionCheckHook();

    let handlerRuns = 0;
    const handler = async () => {
      handlerRuns += 1;
      return { ok: true };
    };

    const first = await state.callTool(handler);
    const second = await state.callTool(handler);

    expect(first.isError).toBe(true);
    expect(second.isError).toBe(false);
    expect(handlerRuns).toBe(1);
  });

  it("checks the Umbraco server version before handling CLI commands, and only configures the blocking hook after", async () => {
    const events: string[] = [];
    const state = createVersionCheckState();
    state.checkUmbracoVersion.mockImplementation(async () => {
      events.push("version-checked");
    });
    state.configureVersionCheckHook.mockImplementation(() => {
      events.push("version-hook-configured");
    });

    const handleCliCommands = jest.fn(async () => {
      events.push("cli-commands-handled");
    });

    mockModules(state, handleCliCommands);
    mockClient(async () => ({ version: MATCHING_VERSION }));

    await import("../index.js");
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(events.indexOf("version-checked")).toBeLessThan(events.indexOf("cli-commands-handled"));
    // The blocking hook must be configured strictly after handleCliCommands,
    // not before — see the long comment at the top of this file.
    expect(events.indexOf("version-hook-configured")).toBeGreaterThan(events.indexOf("cli-commands-handled"));
  });
});
