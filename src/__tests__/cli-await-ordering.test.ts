import { jest } from "@jest/globals";

// Regression test for #424: `handleCliCommands(...)` in src/index.ts must be
// awaited. `handleCliCommands` exits the process itself once a CLI flag
// (--list-tools, --call, ...) is handled, but for `--call` that happens only
// after an internal `await` (the tool's own async handler). If the call site
// doesn't await it, main() races ahead into `new McpServer()` /
// `StdioServerTransport` / `server.connect()` — attaching a stdin listener —
// while the `--call` tool handler is still running. A caller that leaves
// stdin open/piped (the exact repro in #424) then hits a live MCP stdio
// server it never asked for, instead of getting its `--call` result.
//
// This test doesn't depend on real network/tool timing (which is fast and
// hides the race on localhost — see PR discussion): it fully mocks the SDK
// boundary and gives the CLI-commands path an artificial delay, so the test
// deterministically fails if the `await` is ever dropped again, regardless
// of machine speed.
describe("CLI bootstrap ordering (regression for #424)", () => {
  const realExit = process.exit;

  afterEach(() => {
    jest.resetModules();
    process.exit = realExit;
  });

  it("never connects the stdio transport before the CLI command handling settles", async () => {
    const events: string[] = [];

    const handleCliCommands = jest.fn(async () => {
      // Mirrors the real `--call` branch: it resolves via an internal
      // `await` (the tool's own async handler) before the function would
      // go on to call `process.exit()`.
      await new Promise((resolve) => setTimeout(resolve, 30));
      events.push("cli-commands-settled");
    });

    class FakeTransport {}
    class FakeServer {
      constructor(..._args: unknown[]) {}
      async connect(..._args: unknown[]) {
        events.push("server-connect");
      }
    }

    jest.unstable_mockModule("@modelcontextprotocol/sdk/server/mcp.js", () => ({
      McpServer: FakeServer,
    }));
    jest.unstable_mockModule("@modelcontextprotocol/sdk/server/stdio.js", () => ({
      StdioServerTransport: FakeTransport,
    }));
    jest.unstable_mockModule("@umbraco-cms/mcp-server-sdk", () => ({
      checkUmbracoVersion: jest.fn(async () => undefined),
      configureVersionCheckHook: jest.fn(),
      getVersionCheckMessage: jest.fn(() => undefined),
      configureApiClient: jest.fn(),
      initializeUmbracoFetch: jest.fn(),
      getServerConfig: jest.fn(async () => ({
        cliFlags: { callTool: "get-server-information" },
      })),
      handleCliCommands,
      createCollectionConfigLoader: jest.fn(() => ({
        loadFromConfig: () => ({}),
      })),
    }));
    jest.unstable_mockModule("@umb-management-client", () => ({
      UmbracoManagementClient: {
        getClient: () => ({
          getUserCurrent: async () => ({}),
          getServerInformation: async () => ({ version: "18.0.0" }),
        }),
      },
    }));
    jest.unstable_mockModule("../config/index.js", () => ({
      loadServerConfig: jest.fn(async () => ({ umbraco: { auth: {} } })),
      clearConfigCache: jest.fn(),
      allModes: {},
      allModeNames: [],
      allSliceNames: [],
    }));
    jest.unstable_mockModule("../umbraco-api/tools/collection-registry.js", () => ({
      availableCollections: [],
    }));
    jest.unstable_mockModule("../umbraco-api/tools/tool-factory.js", () => ({
      UmbracoToolFactory: jest.fn(),
    }));

    // Safety net: if any mock above is incomplete, main()'s catch handler
    // calls the real process.exit(1), which would kill the Jest worker.
    process.exit = ((code?: number) => {
      throw new Error(`process.exit(${code}) called during test`);
    }) as never;

    // Importing src/index.ts triggers `main().catch(...)` as a module
    // side-effect — exactly like running the CLI.
    await import("../index.js");

    // Let both the delayed CLI-command handling and any (buggy) unawaited
    // continuation of main() run to completion.
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(events).toContain("cli-commands-settled");
    expect(events).toContain("server-connect");
    expect(events.indexOf("cli-commands-settled")).toBeLessThan(
      events.indexOf("server-connect"),
    );
  });
});
