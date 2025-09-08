// CRUD operations
import CreateStylesheetTool from "./post/create-stylesheet.js";
import CreateStylesheetFolderTool from "./post/create-stylesheet-folder.js";
import GetStylesheetByPathTool from "./get/get-stylesheet-by-path.js";
import GetStylesheetFolderByPathTool from "./get/get-stylesheet-folder-by-path.js";
import UpdateStylesheetTool from "./put/update-stylesheet.js";
import RenameStylesheetTool from "./put/rename-stylesheet.js";
import DeleteStylesheetTool from "./delete/delete-stylesheet.js";
import DeleteStylesheetFolderTool from "./delete/delete-stylesheet-folder.js";

// Tree operations
import GetStylesheetAncestorsTool from "./items/get/get-ancestors.js";
import GetStylesheetChildrenTool from "./items/get/get-children.js";
import GetStylesheetRootTool from "./items/get/get-root.js";
import GetStylesheetSearchTool from "./items/get/get-search.js";

import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const StylesheetCollection: ToolCollectionExport = {
  metadata: {
    name: 'stylesheet',
    displayName: 'Stylesheets',
    description: 'CSS stylesheet file management',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [GetStylesheetSearchTool()];

    if (AuthorizationPolicies.TreeAccessStylesheets(user)) {
      // Basic CRUD operations
      tools.push(CreateStylesheetTool());
      tools.push(CreateStylesheetFolderTool());
      tools.push(GetStylesheetByPathTool());
      tools.push(GetStylesheetFolderByPathTool());
      tools.push(UpdateStylesheetTool());
      tools.push(RenameStylesheetTool());
      tools.push(DeleteStylesheetTool());
      tools.push(DeleteStylesheetFolderTool());

      // Tree operations
      tools.push(GetStylesheetAncestorsTool());
      tools.push(GetStylesheetChildrenTool());
      tools.push(GetStylesheetRootTool());
    }

    return tools;
  }
};

// Backwards compatibility export
export const StylesheetTools = (user: CurrentUserResponseModel) => {
  return StylesheetCollection.tools(user);
};

// Legacy exports for backward compatibility
export { default as CreateStylesheetTool } from "./post/create-stylesheet.js";
export { default as CreateStylesheetFolderTool } from "./post/create-stylesheet-folder.js";
export { default as GetStylesheetByPathTool } from "./get/get-stylesheet-by-path.js";
export { default as GetStylesheetFolderByPathTool } from "./get/get-stylesheet-folder-by-path.js";
export { default as UpdateStylesheetTool } from "./put/update-stylesheet.js";
export { default as RenameStylesheetTool } from "./put/rename-stylesheet.js";
export { default as DeleteStylesheetTool } from "./delete/delete-stylesheet.js";
export { default as DeleteStylesheetFolderTool } from "./delete/delete-stylesheet-folder.js";
export { default as GetStylesheetAncestorsTool } from "./items/get/get-ancestors.js";
export { default as GetStylesheetChildrenTool } from "./items/get/get-children.js";
export { default as GetStylesheetRootTool } from "./items/get/get-root.js";
export { default as GetStylesheetSearchTool } from "./items/get/get-search.js";