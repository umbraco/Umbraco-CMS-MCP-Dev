import GetSearcherTool from "./get/get-searcher.js";
import GetSearcherBySearcherNameQueryTool from "./get/get-searcher-by-searcher-name-query.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const SearcherCollection: ToolCollectionExport = {
  metadata: {
    name: 'searcher',
    displayName: 'Searcher',
    description: 'Searcher management and query operations',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    return [
      GetSearcherTool(),
      GetSearcherBySearcherNameQueryTool()
    ];
  }
};

// Backwards compatibility export
export const SearcherTools = (user: CurrentUserResponseModel) => {
  return SearcherCollection.tools(user);
};