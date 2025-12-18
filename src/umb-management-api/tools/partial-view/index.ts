// CRUD operations
import CreatePartialViewTool from "./post/create-partial-view.js";
import CreatePartialViewFolderTool from "./post/create-partial-view-folder.js";
import GetPartialViewByPathTool from "./get/get-partial-view-by-path.js";
import GetPartialViewFolderByPathTool from "./get/get-partial-view-folder-by-path.js";
import UpdatePartialViewTool from "./put/update-partial-view.js";
import RenamePartialViewTool from "./put/rename-partial-view.js";
import DeletePartialViewTool from "./delete/delete-partial-view.js";
import DeletePartialViewFolderTool from "./delete/delete-partial-view-folder.js";

// Snippet operations
import GetPartialViewSnippetTool from "./get/get-partial-view-snippet.js";
import GetPartialViewSnippetByIdTool from "./get/get-partial-view-snippet-by-id.js";

// Tree operations
import GetPartialViewAncestorsTool from "./items/get/get-ancestors.js";
import GetPartialViewChildrenTool from "./items/get/get-children.js";
import GetPartialViewRootTool from "./items/get/get-root.js";
import GetPartialViewSearchTool from "./items/get/get-search.js";
import GetPartialViewSiblingsTool from "./items/get/get-siblings.js";

import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const PartialViewCollection: ToolCollectionExport = {
  metadata: {
    name: 'partial-view',
    displayName: 'Partial Views',
    description: 'Razor partial view file management and templating',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    if (AuthorizationPolicies.TreeAccessPartialViews(user)) {
      // Basic CRUD operations
      tools.push(CreatePartialViewTool);
      tools.push(CreatePartialViewFolderTool);
      tools.push(GetPartialViewByPathTool);
      tools.push(GetPartialViewFolderByPathTool);
      tools.push(UpdatePartialViewTool);
      tools.push(RenamePartialViewTool);
      tools.push(DeletePartialViewTool);
      tools.push(DeletePartialViewFolderTool);

      // Snippet operations
      tools.push(GetPartialViewSnippetTool);
      tools.push(GetPartialViewSnippetByIdTool);

      // Tree operations
      tools.push(GetPartialViewAncestorsTool);
      tools.push(GetPartialViewChildrenTool);
      tools.push(GetPartialViewRootTool);
      tools.push(GetPartialViewSearchTool);
      tools.push(GetPartialViewSiblingsTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const PartialViewTools = (user: CurrentUserResponseModel) => {
  return PartialViewCollection.tools(user);
};