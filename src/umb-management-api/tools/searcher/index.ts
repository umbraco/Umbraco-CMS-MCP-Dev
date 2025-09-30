import GetSearcherTool from "./get/get-searcher.js";
import GetSearcherBySearcherNameQueryTool from "./get/get-searcher-by-searcher-name-query.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import { ToolDefinition } from "types/tool-definition.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";

export const SearcherCollection: ToolCollectionExport = {
  metadata: {
    name: 'searcher',
    displayName: 'Searcher',
    description: 'Searcher management and query operations',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {

    const tools: ToolDefinition<any>[] = [];

    if (AuthorizationPolicies.SectionAccessSettings(user)) {
      tools.push(GetSearcherTool());
      tools.push(GetSearcherBySearcherNameQueryTool());
    }

    return tools;
  }
};

// Backwards compatibility export
export const SearcherTools = (user: CurrentUserResponseModel) => {
  return SearcherCollection.tools(user);
};