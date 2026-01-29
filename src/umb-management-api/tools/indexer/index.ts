import GetIndexerTool from "./get/get-indexer.js";
import GetIndexerByIndexNameTool from "./get/get-indexer-by-index-name.js";
import PostIndexerByIndexNameRebuildTool from "./post/post-indexer-by-index-name-rebuild.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const IndexerCollection: ToolCollectionExport = {
  metadata: {
    name: 'indexer',
    displayName: 'Indexer',
    description: 'Index management and configuration operations',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {

    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.SectionAccessSettings(user)) {
      tools.push(GetIndexerTool);
      tools.push(GetIndexerByIndexNameTool);
      tools.push(PostIndexerByIndexNameRebuildTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const IndexerTools = (user: CurrentUserResponseModel) => {
  return IndexerCollection.tools(user);
};