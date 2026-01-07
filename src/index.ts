#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { UmbracoMcpServer } from "./server/umbraco-mcp-server.js";

import { UmbracoToolFactory } from "./umb-management-api/tools/tool-factory.js";

import { UmbracoManagementClient } from "@umb-management-client";
import { getServerConfig } from "./config.js";
import { initializeUmbracoAxios } from "./orval/client/umbraco-axios.js";
import { checkUmbracoVersion } from "./helpers/version-check/check-umbraco-version.js";

const main = async () => {
  // Load and validate configuration
  const config = getServerConfig(true); // true = stdio mode (no logging)

  // Initialize Axios client with configuration
  initializeUmbracoAxios(config.auth);

  // Create an MCP server
  const server = UmbracoMcpServer.GetServer();
  const client = UmbracoManagementClient.getClient();

  const user = await client.getUserCurrent();

  // Check Umbraco version compatibility (logs result internally)
  await checkUmbracoVersion(client);

  UmbracoToolFactory(server, user, config);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
