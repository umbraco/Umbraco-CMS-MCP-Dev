import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Import collections (new format)
import { DataTypeCollection } from "./data-type/index.js";

import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition, ToolSliceName } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import { CollectionConfigLoader } from "@/helpers/config/collection-config-loader.js";
import { CollectionConfiguration } from "../../types/collection-configuration.js";
import type { UmbracoServerConfig } from "../../config.js";
import { createToolAnnotations } from "@/helpers/mcp/tool-decorators.js";

/**
 * Check if a tool is allowed based on its explicit slice assignments.
 * Tools with empty slices array are ALWAYS included.
 */
function isToolAllowedByExplicitSlices(
  toolSlices: ToolSliceName[],
  enabledSlices: string[],
  disabledSlices: string[]
): boolean {
  // Tools with empty slices array are ALWAYS included
  if (toolSlices.length === 0) {
    return true;
  }

  // Check if ANY of the tool's slices is in the disabled list
  if (disabledSlices.length > 0) {
    if (toolSlices.some(slice => disabledSlices.includes(slice))) {
      return false;
    }
  }

  // If enabled slices specified, ALL of the tool's slices must be in the enabled list
  if (enabledSlices.length > 0) {
    return toolSlices.every(slice => enabledSlices.includes(slice));
  }

  return true;
}

// Available collections (converted to new format)
const availableCollections: ToolCollectionExport[] = [
  DataTypeCollection,
];

// Enhanced mapTools with collection filtering, slice filtering, and readonly support
const mapTools = (
  server: McpServer,
  user: CurrentUserResponseModel,
  tools: ToolDefinition<any>[],
  config: CollectionConfiguration,
  readonlyMode: boolean,
  filteredTools: string[]
) => {
  return tools.forEach(tool => {
    // Check if user has permission for this tool
    const userHasPermission = (tool.enabled === undefined || tool.enabled(user));
    if (!userHasPermission) return;

    // Readonly mode filter - skip write tools
    // readOnlyHint is required in annotations (defaults to false if not provided)
    const readOnlyHint = tool.annotations?.readOnlyHint ?? false;
    if (readonlyMode && !readOnlyHint) {
      filteredTools.push(tool.name);
      return;
    }

    // Apply slice-level filtering using explicit slice assignments
    if (!isToolAllowedByExplicitSlices(tool.slices, config.enabledSlices, config.disabledSlices)) {
      return;
    }

    // Apply tool-level filtering from configuration
    if (config.disabledTools?.includes(tool.name)) return;
    if (config.enabledTools?.length && !config.enabledTools.includes(tool.name)) return;

    // Build annotations from tool definition
    // openWorldHint is always true since all tools use the Umbraco API
    const annotations = createToolAnnotations(tool);

    // Register the tool using the new registerTool API (supports outputSchema and annotations)
    server.registerTool(tool.name, {
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      annotations,
    }, tool.handler);
  })
}

function validateConfiguration(config: CollectionConfiguration, collections: ToolCollectionExport[]): void {
  const availableNames = new Set(collections.map(c => c.metadata.name));
  
  // Check all referenced collection names exist
  const referencedNames = [
    ...config.enabledCollections,
    ...config.disabledCollections,
    ...collections.flatMap(c => c.metadata.dependencies || [])
  ];
  
  const invalid = referencedNames.filter(name => !availableNames.has(name));
  if (invalid.length > 0) {
    console.warn(`Referenced collections don't exist: ${[...new Set(invalid)].join(', ')}`);
  }
}

function resolveDependencies(requestedNames: string[], collections: ToolCollectionExport[]): string[] {
  const result = new Set(requestedNames);
  const collectionMap = new Map(collections.map(c => [c.metadata.name, c]));
  
  // Recursively add dependencies
  function addDependencies(collectionName: string) {
    const collection = collectionMap.get(collectionName);
    if (collection?.metadata.dependencies) {
      collection.metadata.dependencies.forEach(dep => {
        if (!result.has(dep)) {
          result.add(dep);
          addDependencies(dep); // Recursive dependency resolution
        }
      });
    }
  }
  
  requestedNames.forEach(addDependencies);
  return Array.from(result);
}

function getEnabledCollections(config: CollectionConfiguration): ToolCollectionExport[] {
  const allCollectionNames = availableCollections.map(c => c.metadata.name);
  
  // Apply collection filtering logic (same as tool filtering)
  let enabledNames = allCollectionNames.filter(name => {
    // Always exclude collections in the disabled list
    if (config.disabledCollections.includes(name)) return false;
    
    // If enabled list exists, only include collections in that list
    if (config.enabledCollections.length > 0) {
      return config.enabledCollections.includes(name);
    }
    
    // Otherwise, include all collections (default behavior)
    return true;
  });
  
  // Resolve dependencies - add required collections
  const enabledWithDependencies = resolveDependencies(enabledNames, availableCollections);
  
  return availableCollections.filter(collection => 
    enabledWithDependencies.includes(collection.metadata.name)
  );
}

export function UmbracoToolFactory(server: McpServer, user: CurrentUserResponseModel, serverConfig: UmbracoServerConfig) {
  // Load collection configuration from server config
  const config = CollectionConfigLoader.loadFromConfig(serverConfig);
  const readonlyMode = serverConfig.readonly ?? false;
  const filteredTools: string[] = [];

  // Validate configuration
  validateConfiguration(config, availableCollections);

  // Get enabled collections based on configuration
  const enabledCollections = getEnabledCollections(config);

  // Load tools from enabled collections only
  enabledCollections.forEach(collection => {
    const tools = collection.tools(user);
    mapTools(server, user, tools, config, readonlyMode, filteredTools);
  });

  // Log filtered tools in readonly mode
  if (readonlyMode && filteredTools.length > 0) {
    console.log(`\nReadonly mode: Disabled ${filteredTools.length} write tools:`);
    console.log(`  ${filteredTools.join(', ')}`);
  }
}
