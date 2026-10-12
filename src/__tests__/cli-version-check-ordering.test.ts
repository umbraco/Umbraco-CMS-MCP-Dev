import { jest } from "@jest/globals";

// Regression test for #426 / the PR #540 review: a failed `/server/information`
// fetch must not throw out of `main()` and kill every CLI command — including
// ones, like `--list-tools`, that don't need the version at all.
//
// The real end-to-end "warns but still runs --call" behaviour now lives in
// src/__tests__/cli-call-stdin.test.ts, which spawns the built CLI against a
// live Umbraco instance and so exercises the actual MCP SDK pre-execution
// check rather than a model of it. This file keeps only the one case that
// can't be exercised that way: a live instance can't be made unreachable on
// demand, so the failed-fetch path is modeled here instead.
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
    // from .env) would override UMBRACO_TARGET_MAJOR and silently change what
    // this test's mismatch means to src/index.ts.
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

    return { checkUmbracoVersion, configureVersionCheckHook, getVersionCheckMessage };
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
});
