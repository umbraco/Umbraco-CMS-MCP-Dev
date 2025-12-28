import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { CollectionConfigLoader } from "@/helpers/config/collection-config-loader.js";
import type { UmbracoServerConfig } from "../../config.js";
import { availableCollections } from "./collection-registry.js";
import { CollectionResolver } from "./collection-resolver.js";
import { ToolRegistrar } from "./tool-registrar.js";

/**
 * Main entry point for registering Umbraco MCP tools.
 * Orchestrates collection loading, filtering, and tool registration.
 */
export function UmbracoToolFactory(server: McpServer, user: CurrentUserResponseModel, serverConfig: UmbracoServerConfig) {
  // Load collection configuration from server config
  const config = CollectionConfigLoader.loadFromConfig(serverConfig);
  const readonlyMode = serverConfig.readonly ?? false;
  const filteredTools: string[] = [];

  // Validate configuration
  CollectionResolver.validateConfiguration(config, availableCollections);

  // Get enabled collections based on configuration
  const enabledCollections = CollectionResolver.getEnabledCollections(config, availableCollections);

  // Load and register tools from enabled collections
  enabledCollections.forEach(collection => {
    const tools = collection.tools(user);
    ToolRegistrar.registerTools(server, user, tools, config, readonlyMode, filteredTools);
  });

  // Log filtered tools in readonly mode
  if (readonlyMode && filteredTools.length > 0) {
    console.log(`\nReadonly mode: Disabled ${filteredTools.length} write tools:`);
    console.log(`  ${filteredTools.join(', ')}`);
  }
}
