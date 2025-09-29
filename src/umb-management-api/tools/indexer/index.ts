import GetIndexerTool from "./get/get-indexer.js";
import GetIndexerByIndexNameTool from "./get/get-indexer-by-index-name.js";
import PostIndexerByIndexNameRebuildTool from "./post/post-indexer-by-index-name-rebuild.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const IndexerCollection: ToolCollectionExport = {
  metadata: {
    name: 'indexer',
    displayName: 'Indexer',
    description: 'Index management and configuration operations',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    return [
      GetIndexerTool(),
      GetIndexerByIndexNameTool(),
      PostIndexerByIndexNameRebuildTool()
    ];
  }
};

// Backwards compatibility export
export const IndexerTools = (user: CurrentUserResponseModel) => {
  return IndexerCollection.tools(user);
};