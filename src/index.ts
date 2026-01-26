#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import packageJson from "../package.json" with { type: "json" };

import { UmbracoToolFactory } from "./umb-management-api/tools/tool-factory.js";

import { UmbracoManagementClient } from "@umb-management-client";
import { checkUmbracoVersion, configureApiClient, initializeUmbracoAxios } from "@umbraco-cms/mcp-server-sdk";
import { loadServerConfig, clearConfigCache } from "./config/index.js";

const main = async () => {
  // Clear config cache to ensure fresh config for each server start
  clearConfigCache();

  // Load and validate configuration
  const serverConfig = loadServerConfig(true); // true = stdio mode (no logging)
  const config = serverConfig.umbraco;

  // Initialize Axios client with configuration
  initializeUmbracoAxios(config.auth);

  // Configure API client for SDK helpers (executeVoidApiCall, etc.)
  configureApiClient(() => UmbracoManagementClient.getClient());

  // Create an MCP server
  const server = new McpServer({
    name: "Umbraco CMS Developer MCP Server",
    version: packageJson.version,
  });
  const client = UmbracoManagementClient.getClient();

  const user = await client.getUserCurrent();

  // Check Umbraco version compatibility (logs result internally)
  await checkUmbracoVersion({
    mcpVersion: packageJson.version,
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
