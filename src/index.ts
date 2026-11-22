#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import packageJson from "../package.json" with { type: "json" };

import { UmbracoToolFactory } from "./umbraco-api/tools/tool-factory.js";

import { UmbracoManagementClient } from "@umb-management-client";
import { prepareStartupVersionCheck, configureApiClient, initializeUmbracoFetch, getServerConfig, handleCliCommands, createCollectionConfigLoader } from "@umbraco-cms/mcp-server-sdk";
import { loadServerConfig, clearConfigCache, allModes, allModeNames, allSliceNames } from "./config/index.js";
import { UMBRACO_TARGET_MAJOR } from "./config/umbraco-target.generated.js";
import { availableCollections } from "./umbraco-api/tools/collection-registry.js";
import { setUmbracoVersion, setAllowFilePathUploads } from "./umbraco-api/runtime-context.js";
import { describeUnreachableServer, formatFatalError, isDebugEnabled } from "./startup-errors.js";

const main = async () => {
  // Node/stdio environment supports filesystem access; enable filePath uploads.
  setAllowFilePathUploads(true);

  // Clear config cache to ensure fresh config for each server start
  clearConfigCache();

  // Load and validate configuration
  const serverConfig = await loadServerConfig(true); // true = stdio mode (no logging)
  const config = serverConfig.umbraco;

  // Initialize fetch client with configuration
  initializeUmbracoFetch(config.auth);

  // Configure API client for SDK helpers (executeVoidApiCall, etc.)
  configureApiClient(() => UmbracoManagementClient.getClient());

  const client = UmbracoManagementClient.getClient();

  let user: Awaited<ReturnType<typeof client.getUserCurrent>>;
  try {
    user = await client.getUserCurrent();
  } catch (error) {
    throw describeUnreachableServer(error, config.auth.baseUrl);
  }

  // Fetch the connected instance's version ourselves: collection registrations
  // need it (setUmbracoVersion) to gate tools whose endpoints were introduced
  // in newer Umbraco releases. The SDK's startup guard below makes no request
  // at all when a parent server already checked the same major (see the
  // chained-child note below), so it can't be the only source of the version.
  //
  // A failure is caught locally: an unreachable or unauthorised
  // /server/information must not throw out of main() and kill every CLI
  // command (including ones, like --list-tools, that don't need the version).
  // The cached failure is rethrown into the guard's client below, which turns
  // it into an "unable to verify" warning without repeating the request.
  let serverInfo: Awaited<ReturnType<typeof client.getServerInformation>> | undefined;
  let serverInfoError: unknown;
  try {
    serverInfo = await client.getServerInformation();
  } catch (error) {
    serverInfoError = error;
  }
  if (serverInfo) {
    setUmbracoVersion(serverInfo.version);
  }

  // Umbraco-major guard. Runs before handleCliCommands so every CLI entry
  // point (--call, --list-tools, ...) prints the mismatch warning (#426);
  // handleCliCommands exits the process itself, so anything after it never
  // runs for those flags. Arming the one-time block is deferred until after
  // it (versionCheck.armBlock() below), so --call warns rather than refuses.
  //
  // Chained use (#593): a parent server that runs its own guard (e.g. the
  // Umbraco Editor MCP) sets UMBRACO_MCP_PARENT_CHECKED_MAJOR in our spawn env
  // via the SDK's chainedVersionCheckEnv(). When it names the major this
  // server targets, the guard is skipped entirely: no request, no block, no
  // `instructions` warning, so the user isn't blocked twice for one mismatch.
  // A parent that checked a different major doesn't switch our check off.
  //
  // UMBRACO_TARGET_MAJOR is stamped into src/config/umbraco-target.generated.ts
  // by the orval target-major transformer; UMBRACO_EXPECTED_MAJOR overrides it
  // (a blank value falls back to the generated major).
  const versionCheck = await prepareStartupVersionCheck({
    expectedUmbracoMajorOverride: process.env.UMBRACO_EXPECTED_MAJOR,
    generatedUmbracoMajor: UMBRACO_TARGET_MAJOR,
    mcpVersion: packageJson.version,
    client: {
      getServerInformation: async () => {
        if (serverInfo) return serverInfo;
        throw serverInfoError ?? new Error("Unable to fetch Umbraco server information");
      },
    },
  });

  // Handle CLI introspection flags (--list-tools, --describe-tool, --generate-context, --call)
  // This runs after auth so we have the real user for tool filtering
  const rawConfig = await getServerConfig(true);
  const configLoader = createCollectionConfigLoader({
    modeRegistry: allModes,
    allModeNames,
    allSliceNames,
  });
  const filterConfig = configLoader.loadFromConfig(config);
  // Must be awaited: handleCliCommands exits the process itself for every
  // recognized flag, but --call resolves via an async tool handler before it
  // gets there. Without awaiting, main() races ahead into MCP server startup
  // (StdioServerTransport attaches to stdin) while the tool call is still in
  // flight — a programmatic caller with piped/open stdin then hangs waiting
  // on MCP protocol input instead of getting the --call result. See #424.
  await handleCliCommands(availableCollections, {
    cliFlags: rawConfig.cliFlags,
    serverName: "Umbraco CMS Developer MCP Server",
    serverVersion: packageJson.version,
    user,
    filterConfig,
    serverConfig: config,
  });

  // Reaching here means no CLI flag matched (handleCliCommands exits the
  // process itself for every one it handles), so we're about to start the
  // real MCP stdio server. Only now does a mismatch gate tool execution:
  // arming it any earlier would also block the --call branch's direct
  // tool.handler() invocation above. It blocks the *next* tool call once,
  // then clears itself — a one-time speed bump, not a persistent block.
  versionCheck.armBlock();

  // Surface any mismatch warning to the client during `initialize` — most hosts
  // fold `instructions` into the model's system prompt.
  const versionCheckMessage = versionCheck.message;

  // Create an MCP server
  const server = new McpServer(
    {
      name: "Umbraco CMS Developer MCP Server",
      version: packageJson.version,
    },
    versionCheckMessage ? { instructions: versionCheckMessage } : undefined,
  );

  UmbracoToolFactory(server, user, config);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

main().catch((error) => {
  // One line by default; full stack trace and cause chain when
  // UMBRACO_MCP_DEBUG is set (see startup-errors.ts).
  console.error(...formatFatalError(error, isDebugEnabled()));
  process.exit(1);
});
