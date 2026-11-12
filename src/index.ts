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

/**
 * Wraps a bare connection failure (Node's fetch throws `TypeError: fetch
 * failed` with no indication of *where* it tried to connect) with the
 * configured base URL, so the fatal error printed at the bottom of this file
 * says which site was unreachable instead of just "fetch failed". Anything
 * else — wrong credentials, a non-2xx response, etc — already carries its
 * own clear message (e.g. "Token request failed: 401 Unauthorized") and is
 * rethrown unchanged. Never includes clientId/clientSecret: only the base
 * URL, which isn't a secret.
 */
const describeUnreachableServer = (error: unknown, baseUrl: string): unknown => {
  if (error instanceof TypeError && error.message === "fetch failed") {
    const cause = (error as { cause?: unknown }).cause;
    const causeMessage = cause instanceof Error ? `: ${cause.message}` : "";
    return new Error(`Could not reach Umbraco at ${baseUrl || "(no base URL configured)"} (fetch failed${causeMessage})`, { cause: error });
  }
  return error;
};

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

  // Check Umbraco version compatibility (logs result internally) and capture the
  // version so collection registrations can gate tools whose endpoints were
  // introduced in newer Umbraco releases.
  //
  // This must run before handleCliCommands below: handleCliCommands's --call
  // branch invokes a tool handler directly and calls process.exit() itself,
  // so anything placed after it never runs for `--call`. Running the check
  // here instead means every CLI entry point — the MCP stdio server, --call,
  // and the introspection flags (--list-tools, --describe-tool, etc, which
  // already authenticate above via getUserCurrent) — gets the same
  // major-mismatch warning instead of only the MCP tool-call path. See #426.
  //
  // getServerInformation() is awaited outside checkUmbracoVersion's own
  // try/catch, so a failure here is caught locally: an unreachable or
  // unauthorised /server/information must not throw out of main() and kill
  // every CLI command (including ones, like --list-tools, that don't need
  // the version at all). Leaving serverInfo undefined makes the wrapper below
  // rethrow this same cached failure into checkUmbracoVersion's own
  // try/catch, which logs its "unable to verify" message instead — the call
  // itself isn't repeated. Only the fetch is guarded here: setUmbracoVersion
  // is a trivial assignment that can't fail on its own, and keeping it
  // outside the try means a future change to it can't inherit this call's
  // error handling by accident.
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
  await checkUmbracoVersion({
    mcpVersion: packageJson.version,
    // UMBRACO_TARGET_MAJOR is stamped into src/config/umbraco-target.generated.ts
    // by the orval target-major transformer, from the Umbraco instance the API
    // client was generated against. Override to point at a different major.
    // (`?.trim() ||`, not `??`: an env var set to an empty string must still
    // fall back, or the check silently no-ops with no log output at all.)
    expectedUmbracoMajor: process.env.UMBRACO_EXPECTED_MAJOR?.trim() || UMBRACO_TARGET_MAJOR,
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
  // real MCP stdio server. Only now does a version mismatch gate tool
  // execution: checkUmbracoVersion above already logged the warning
  // unconditionally (including for --call and the introspection flags), but
  // configuring this hook any earlier would also block the --call branch's
  // direct tool.handler() invocation above, turning "warn" into "refuse" for
  // a warn-only check. This one gates the MCP path's *next* tool call with a
  // warning, then clears itself — a one-time speed bump, not a persistent
  // block.
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
  // Print the message once. `error` is usually an Error object, and
  // console.error("Error:", error) would log its full `util.inspect`
  // rendering — whose stack trace already starts with "Error: <message>" —
  // producing a doubled "Error: Error: <message>" prefix. Logging just the
  // message avoids that while keeping the single "Error:" lead-in.
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
