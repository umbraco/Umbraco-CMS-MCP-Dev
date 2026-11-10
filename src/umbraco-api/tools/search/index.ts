import GetSearchIndexesTool from "./get/get-search-indexes.js";
import GetSearchIndexTool from "./get/get-search-index.js";
import RebuildSearchIndexTool from "./put/rebuild-search-index.js";
import SearchIndexedContentTool from "./post/search-indexed-content.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const SearchCollection: ToolCollectionExport = {
  metadata: {
    name: 'search',
    displayName: 'Search',
    description: 'Umbraco Search index inspection, rebuild and query operations',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {

    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.SectionAccessSettings(user)) {
      tools.push(GetSearchIndexesTool);
      tools.push(GetSearchIndexTool);
      tools.push(RebuildSearchIndexTool);

      // Querying an index bypasses content protection, so Umbraco additionally
      // requires admin group membership (SearcherQueryAccess policy).
      if (AuthorizationPolicies.RequireAdminAccess(user)) {
        tools.push(SearchIndexedContentTool);
      }
    }

    return tools;
  }
};

// Backwards compatibility export
export const SearchTools = (user: CurrentUserResponseModel) => {
  return SearchCollection.tools(user);
};
