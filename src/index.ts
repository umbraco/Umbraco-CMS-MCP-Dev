#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { UmbracoMcpServer } from "./server/umbraco-mcp-server.js";

import { UmbracoToolFactory } from "./umb-management-api/tools/tool-factory.js";

import { UmbracoManagementClient } from "@umb-management-client";
import { getServerConfig, checkUmbracoVersion, configureApiClient } from "@umbraco-cms/mcp-server-sdk";
import { initializeUmbracoAxios } from "./orval/client/umbraco-axios.js";

// Version from package.json - used for version compatibility checking
const MCP_VERSION = "17.0.1-beta.3";

const main = async () => {
  // Load and validate configuration using SDK
  const { config } = getServerConfig(true); // true = stdio mode (no logging)

  // Initialize Axios client with configuration
  initializeUmbracoAxios(config.auth);

  // Configure API client for SDK helpers (executeVoidApiCall, etc.)
  configureApiClient(() => UmbracoManagementClient.getClient());

  // Create an MCP server
  const server = UmbracoMcpServer.GetServer();
  const client = UmbracoManagementClient.getClient();

  const user = await client.getUserCurrent();

  // Check Umbraco version compatibility (logs result internally)
  await checkUmbracoVersion({
    mcpVersion: MCP_VERSION,
    client: { getServerInformation: () => client.getServerInformation() }
  });

  UmbracoToolFactory(server, user, config);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
