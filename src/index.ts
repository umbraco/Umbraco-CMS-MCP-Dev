#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { UmbracoMcpServer } from "./server/umbraco-mcp-server.js";

import { UmbracoToolFactory } from "./umb-management-api/tools/tool-factory.js";
import { ResourceFactory } from "./umb-management-api/resources/resource-factory.js";

import { UmbracoManagementClient } from "@umb-management-client";

const main = async () => {
  // Create an MCP server
  const server = UmbracoMcpServer.GetServer();
  const client = UmbracoManagementClient.getClient();

  const user = await client.getUserCurrent();

  ResourceFactory(server);
  UmbracoToolFactory(server, user);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
