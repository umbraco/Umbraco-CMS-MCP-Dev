import { jest } from "@jest/globals";

// Regression test for #426: the Umbraco major-mismatch version check must run
// before `handleCliCommands(...)` in src/index.ts.
//
// `handleCliCommands`'s `--call` branch invokes a tool handler directly and
// calls `process.exit()` itself once the call resolves, so any code placed
// after that call never runs for `--call` invocations. Previously the
// version check (`getServerInformation` -> `setUmbracoVersion` ->
// `checkUmbracoVersion` -> `configureVersionCheckHook`) sat after
// `handleCliCommands`, so a `--call` against a mismatched-major Umbraco
// instance skipped the warning entirely — only the MCP stdio tool-call path
// ever saw it. This test fully mocks the SDK boundary and asserts the
// version check settles before `handleCliCommands` is invoked at all,
// regardless of how long either one takes.
describe("CLI version-check ordering (regression for #426)", () => {
  const realExit = process.exit;

  afterEach(() => {
    jest.resetModules();
    process.exit = realExit;
  });

  it("checks the Umbraco server version before handling CLI commands (e.g. --call)", async () => {
    const events: string[] = [];

    const checkUmbracoVersion = jest.fn(async () => {
      events.push("version-checked");
    });
    const configureVersionCheckHook = jest.fn(() => {
      events.push("version-hook-configured");
    });
    const handleCliCommands = jest.fn(async () => {
      events.push("cli-commands-handled");
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
      checkUmbracoVersion,
      configureVersionCheckHook,
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
    jest.unstable_mockModule("../umbraco-api/runtime-context.js", () => ({
      setUmbracoVersion: jest.fn(),
      setAllowFilePathUploads: jest.fn(),
    }));

    // Safety net: if any mock above is incomplete, main()'s catch handler
    // calls the real process.exit(1), which would kill the Jest worker.
    process.exit = ((code?: number) => {
      throw new Error(`process.exit(${code}) called during test`);
    }) as never;

    // Importing src/index.ts triggers `main().catch(...)` as a module
    // side-effect — exactly like running the CLI.
    await import("../index.js");

    // Let everything settle.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(checkUmbracoVersion).toHaveBeenCalled();
    expect(configureVersionCheckHook).toHaveBeenCalled();
    expect(handleCliCommands).toHaveBeenCalled();
    expect(events).toContain("version-checked");
    expect(events).toContain("cli-commands-handled");
    expect(events.indexOf("version-checked")).toBeLessThan(
      events.indexOf("cli-commands-handled"),
    );
    expect(events.indexOf("version-hook-configured")).toBeLessThan(
      events.indexOf("cli-commands-handled"),
    );
  });
});
