#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import packageJson from "../package.json" with { type: "json" };

import { UmbracoToolFactory } from "./umbraco-api/tools/tool-factory.js";

import { UmbracoManagementClient } from "@umb-management-client";
import { checkUmbracoVersion, configureVersionCheckHook, getVersionCheckMessage, configureApiClient, initializeUmbracoFetch, getServerConfig, handleCliCommands, createCollectionConfigLoader } from "@umbraco-cms/mcp-server-sdk";
import { loadServerConfig, clearConfigCache, allModes, allModeNames, allSliceNames } from "./config/index.js";
import { UMBRACO_TARGET_MAJOR } from "./config/umbraco-target.generated.js";
import { availableCollections } from "./umbraco-api/tools/collection-registry.js";
import { setUmbracoVersion, setAllowFilePathUploads } from "./umbraco-api/runtime-context.js";

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

  const user = await client.getUserCurrent();

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

  // Check Umbraco version compatibility (logs result internally) and capture the
  // version so collection registrations can gate tools whose endpoints were
  // introduced in newer Umbraco releases.
  const serverInfo = await client.getServerInformation();
  setUmbracoVersion(serverInfo.version);
  await checkUmbracoVersion({
    mcpVersion: packageJson.version,
    // UMBRACO_TARGET_MAJOR is stamped into src/config/umbraco-target.generated.ts
    // by the orval target-major transformer, from the Umbraco instance the API
    // client was generated against. Override to point at a different major.
    // (`?.trim() ||`, not `??`: an env var set to an empty string must still
    // fall back, or the check silently no-ops with no log output at all.)
    expectedUmbracoMajor: process.env.UMBRACO_EXPECTED_MAJOR?.trim() || UMBRACO_TARGET_MAJOR,
    client: { getServerInformation: async () => serverInfo }
  });
  // checkUmbracoVersion only writes into its internal service state; this hook
  // and getVersionCheckMessage() below are two independent readers of that same
  // state. This one gates tool execution: a mismatch fails the *next* tool call
  // with a warning, then clears itself — a one-time speed bump, not a
  // persistent block.
  configureVersionCheckHook();

  // Surface any mismatch warning to the client during `initialize` — most hosts
  // fold `instructions` into the model's system prompt.
  const versionCheckMessage = getVersionCheckMessage();

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
  console.error("Error:", error);
  process.exit(1);
});
