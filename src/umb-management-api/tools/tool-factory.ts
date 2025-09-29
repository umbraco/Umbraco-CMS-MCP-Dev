import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Import collections (new format)
import { CultureCollection } from "./culture/index.js";
import { DataTypeCollection } from "./data-type/index.js";
import { DictionaryCollection } from "./dictionary/index.js";
import { DocumentTypeCollection } from "./document-type/index.js";
import { LanguageCollection } from "./language/index.js";
import { DocumentBlueprintCollection } from "./document-blueprint/index.js";
import { DocumentCollection } from "./document/index.js";
import { DocumentVersionCollection } from "./document-version/index.js";
import { MediaCollection } from "./media/index.js";
import { MediaTypeCollection } from "./media-type/index.js";
import { MemberCollection } from "./member/index.js";
import { MemberGroupCollection } from "./member-group/index.js";
import { MemberTypeCollection } from "./member-type/index.js";
import { LogViewerCollection } from "./log-viewer/index.js";
import { PartialViewCollection } from "./partial-view/index.js";
import { PropertyTypeCollection } from "./property-type/index.js";
import { TemplateCollection } from "./template/index.js";
import { WebhookCollection } from "./webhook/index.js";
import { ServerCollection } from "./server/index.js";
import { RedirectCollection } from "./redirect/index.js";
import { UserGroupCollection } from "./user-group/index.js";
import { TemporaryFileCollection } from "./temporary-file/index.js";
import { ScriptCollection } from "./script/index.js";
import { StylesheetCollection } from "./stylesheet/index.js";
import { HealthCollection } from "./health/index.js";
import { ManifestCollection } from "./manifest/index.js";
import { TagCollection } from "./tag/index.js";
import { ModelsBuilderCollection } from "./models-builder/index.js";
import { SearcherCollection } from "./searcher/index.js";
import { IndexerCollection } from "./indexer/index.js";

import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import { CollectionConfigLoader } from "@/helpers/config/collection-config-loader.js";
import { CollectionConfiguration } from "../../types/collection-configuration.js";
import env from "@/helpers/config/env.js";

// Available collections (converted to new format)
const availableCollections: ToolCollectionExport[] = [
  CultureCollection,
  DataTypeCollection,
  DictionaryCollection,
  DocumentTypeCollection,
  LanguageCollection,
  DocumentBlueprintCollection,
  DocumentCollection,
  DocumentVersionCollection,
  MediaCollection,
  MediaTypeCollection,
  MemberCollection,
  MemberGroupCollection,
  MemberTypeCollection,
  LogViewerCollection,
  PartialViewCollection,
  PropertyTypeCollection,
  TemplateCollection,
  WebhookCollection,
  ServerCollection,
  RedirectCollection,
  UserGroupCollection,
  TemporaryFileCollection,
  ScriptCollection,
  StylesheetCollection,
  HealthCollection,
  ManifestCollection,
  TagCollection,
  ModelsBuilderCollection,
  SearcherCollection,
  IndexerCollection
];

// Enhanced mapTools with collection filtering (existing function signature)
const mapTools = (server: McpServer,
  user: CurrentUserResponseModel,
  tools: ToolDefinition<any>[]) => {
  return tools.forEach(tool => {
    // Check if user has permission for this tool
    const userHasPermission = (tool.enabled === undefined || tool.enabled(user));
    if (!userHasPermission) return;
    
    // Apply existing tool-level filtering (preserves current behavior)
    if (env.UMBRACO_EXCLUDE_TOOLS?.includes(tool.name)) return;
    if (env.UMBRACO_INCLUDE_TOOLS?.length && !env.UMBRACO_INCLUDE_TOOLS.includes(tool.name)) return;
    
    // Register the tool
    server.tool(tool.name, tool.description, tool.schema, tool.handler);
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

export function UmbracoToolFactory(server: McpServer, user: CurrentUserResponseModel) {
  // Load collection configuration
  const config = CollectionConfigLoader.loadFromEnv();
  
  // Validate configuration
  validateConfiguration(config, availableCollections);
  
  // Get enabled collections based on configuration
  const enabledCollections = getEnabledCollections(config);
  
  // Load tools from enabled collections only
  enabledCollections.forEach(collection => {
    const tools = collection.tools(user);
    mapTools(server, user, tools);
  });
}
