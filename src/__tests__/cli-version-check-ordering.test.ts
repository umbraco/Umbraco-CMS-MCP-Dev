import { jest } from "@jest/globals";

// Startup version-guard behaviour of src/index.ts, around the SDK's
// `prepareStartupVersionCheck`:
// - #426 / PR #540 review: a failed (or, since the #593 follow-up, hanging)
//   `/server/information` fetch must not kill or stall every CLI command —
//   including ones, like `--list-tools`, that don't need the version at all.
// - The one-time block is armed only after CLI handling, and a mismatch
//   reaches the server's `instructions`.
// - #593: when a parent server checked the same major
//   (UMBRACO_MCP_PARENT_CHECKED_MAJOR), mcp-dev neither blocks nor warns, but
//   still fetches the version for version-gated tools.
//
// The real end-to-end "warns but still runs --call" behaviour lives in
// src/__tests__/cli-call-stdin.test.ts, which spawns the built CLI against a
// live Umbraco instance. The cases here can't be exercised that way: a live
// instance can't be made unreachable, slow or chained on demand.
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
  const originalParentCheckedEnv = process.env.UMBRACO_MCP_PARENT_CHECKED_MAJOR;

  beforeEach(() => {
    // A real UMBRACO_EXPECTED_MAJOR in the test process's environment (e.g.
    // from .env) would override UMBRACO_TARGET_MAJOR and silently change what
    // this test's mismatch means to src/index.ts.
    delete process.env.UMBRACO_EXPECTED_MAJOR;
    delete process.env.UMBRACO_MCP_PARENT_CHECKED_MAJOR;
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
    if (originalParentCheckedEnv === undefined) {
      delete process.env.UMBRACO_MCP_PARENT_CHECKED_MAJOR;
    } else {
      process.env.UMBRACO_MCP_PARENT_CHECKED_MAJOR = originalParentCheckedEnv;
    }
  });

  // The SDK compares majors after parsing, so "18", " 18" and "18.3.2" all
  // mean 18. Mirror that rather than comparing raw strings.
  const majorOf = (value: string | null | undefined) => {
    const major = value?.trim().split(".")[0];
    return major && /^\d+$/.test(major) ? major : null;
  };

  // Short stand-in for the SDK's 5s default, so the hanging-lookup test is fast.
  const TEST_DEADLINE_MS = 50;

  // Mirrors `prepareStartupVersionCheck` and `withVersionCheckDeadline` from
  // `@umbraco-cms/mcp-server-sdk` closely enough to exercise the same
  // behaviour (including the chained-child skip via
  // UMBRACO_MCP_PARENT_CHECKED_MAJOR), without depending on a live Umbraco
  // instance.
  function createVersionCheckState() {
    const calls: string[] = [];
    let blocked = false;

    const prepareStartupVersionCheck = jest.fn(
      async (options: {
        expectedUmbracoMajorOverride?: string | null;
        generatedUmbracoMajor: string;
        client: { getServerInformation: () => Promise<{ version: string }> };
      }) => {
        calls.push("prepare");
        const expected = options.expectedUmbracoMajorOverride?.trim() || options.generatedUmbracoMajor;
        const parentMajor = majorOf(process.env.UMBRACO_MCP_PARENT_CHECKED_MAJOR);
        if (parentMajor !== null && parentMajor === majorOf(expected)) {
          return { message: null, version: null, armBlock: () => { calls.push("armBlock"); } };
        }
        let message: string | null = null;
        let mismatch = false;
        let version: string | null = null;
        try {
          version = (await options.client.getServerInformation()).version;
          const actualMajor = version.split(".")[0];
          if (actualMajor !== expected) {
            mismatch = true;
            message = `⚠️ Version Mismatch: Connected to Umbraco ${actualMajor}.x, but this server targets Umbraco ${expected}.x`;
            console.error(message);
          }
        } catch (error) {
          message = `⚠️ Unable to verify Umbraco version compatibility: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(message);
        }
        return {
          message,
          version,
          armBlock: () => {
            calls.push("armBlock");
            blocked = mismatch;
          },
        };
      },
    );

    const signals: AbortSignal[] = [];
    const withVersionCheckDeadline = jest.fn(async <T,>(request: (signal: AbortSignal) => Promise<T>) => {
      const controller = new AbortController();
      signals.push(controller.signal);
      let timer: ReturnType<typeof setTimeout> | undefined;
      const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Umbraco server information did not respond within ${TEST_DEADLINE_MS}ms`));
          controller.abort();
        }, TEST_DEADLINE_MS);
      });
      try {
        return await Promise.race([request(controller.signal), deadline]);
      } finally {
        clearTimeout(timer);
      }
    });

    return { prepareStartupVersionCheck, withVersionCheckDeadline, signals, calls, isBlocked: () => blocked };
  }

  const serverOptions: unknown[] = [];

  function mockModules(state: ReturnType<typeof createVersionCheckState>, handleCliCommands: ReturnType<typeof jest.fn>) {
    serverOptions.length = 0;
    class FakeTransport {}
    class FakeServer {
      constructor(_info: unknown, options?: unknown) {
        serverOptions.push(options);
      }
      async connect(..._args: unknown[]) {}
    }

    jest.unstable_mockModule("@modelcontextprotocol/sdk/server/mcp.js", () => ({ McpServer: FakeServer }));
    jest.unstable_mockModule("@modelcontextprotocol/sdk/server/stdio.js", () => ({ StdioServerTransport: FakeTransport }));
    jest.unstable_mockModule("@umbraco-cms/mcp-server-sdk", () => ({
      prepareStartupVersionCheck: state.prepareStartupVersionCheck,
      withVersionCheckDeadline: state.withVersionCheckDeadline,
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

  function mockClient(getServerInformation: (options?: { signal?: AbortSignal }) => Promise<{ version: string }>) {
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

    // The guard turned the cached failure into a warning (logged to
    // stderr)...
    expect(errorSpy.mock.calls.some((call) => String(call[0]).includes("Unable to verify Umbraco version compatibility"))).toBe(true);
    // ...instead of throwing out of main() and killing every CLI command:
    // handleCliCommands (here, standing in for the real --list-tools branch)
    // still ran and exited cleanly.
    expect(handleCliCommands).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("tool table");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("does not hang startup when /server/information never answers: warns after the deadline and still runs --list-tools", async () => {
    const state = createVersionCheckState();
    const handleCliCommands = jest.fn(async () => {
      state.calls.push("handleCliCommands");
    });

    mockModules(state, handleCliCommands);
    // Never resolves, like a stalled proxy.
    let clientSignal: AbortSignal | undefined;
    mockClient((options) => {
      clientSignal = options?.signal;
      return new Promise<{ version: string }>(() => {});
    });
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await import("../index.js");
    await new Promise((resolve) => setTimeout(resolve, TEST_DEADLINE_MS + 100));

    expect(state.withVersionCheckDeadline).toHaveBeenCalledTimes(1);
    // index.ts passed the deadline's signal to the client call, and it was
    // aborted at the deadline.
    expect(clientSignal).toBe(state.signals[0]);
    expect(clientSignal?.aborted).toBe(true);
    expect(errorSpy.mock.calls.some((call) => String(call[0]).includes("did not respond"))).toBe(true);
    expect(state.calls).toEqual(["prepare", "handleCliCommands", "armBlock"]);
    expect(state.isBlocked()).toBe(false);
  });

  // The mismatched version is built from the generated major so the test
  // doesn't depend on which major this branch targets.
  async function mismatchedVersion() {
    const { UMBRACO_TARGET_MAJOR } = await import("../config/umbraco-target.generated.js");
    return { targetMajor: UMBRACO_TARGET_MAJOR, version: `${Number(UMBRACO_TARGET_MAJOR) + 1}.0.0` };
  }

  it("standalone: on a mismatch, warns in instructions and arms the block only after CLI handling", async () => {
    const { targetMajor, version } = await mismatchedVersion();
    const state = createVersionCheckState();
    const handleCliCommands = jest.fn(async () => {
      state.calls.push("handleCliCommands");
    });

    mockModules(state, handleCliCommands);
    mockClient(async () => ({ version }));
    jest.spyOn(console, "error").mockImplementation(() => {});

    await import("../index.js");
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(state.prepareStartupVersionCheck).toHaveBeenCalledWith(
      expect.objectContaining({ generatedUmbracoMajor: targetMajor }),
    );
    expect(state.calls).toEqual(["prepare", "handleCliCommands", "armBlock"]);
    expect(state.isBlocked()).toBe(true);
    expect(serverOptions[0]).toEqual({ instructions: expect.stringContaining("Version Mismatch") });
  });

  it("chained (#593): when the parent checked the same major, neither blocks nor warns", async () => {
    const { targetMajor, version } = await mismatchedVersion();
    process.env.UMBRACO_MCP_PARENT_CHECKED_MAJOR = targetMajor;
    const state = createVersionCheckState();
    const handleCliCommands = jest.fn(async () => {});

    mockModules(state, handleCliCommands);
    const getServerInformation = jest.fn(async () => ({ version }));
    mockClient(getServerInformation);
    const runtimeContext = { setUmbracoVersion: jest.fn(), setAllowFilePathUploads: jest.fn() };
    jest.unstable_mockModule("../umbraco-api/runtime-context.js", () => runtimeContext);

    await import("../index.js");
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(state.isBlocked()).toBe(false);
    expect(serverOptions[0]).toBeUndefined();
    // mcp-dev still fetches the version itself, so version-gated tools keep
    // working even though the guard made no request.
    expect(getServerInformation).toHaveBeenCalledTimes(1);
    expect(runtimeContext.setUmbracoVersion).toHaveBeenCalledWith(version);
  });
});
