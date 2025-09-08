import GetScriptByPathTool from "./get/get-script-by-path.js";
import GetScriptFolderByPathTool from "./get/get-script-folder-by-path.js";
import GetScriptItemsTool from "./get/get-script-items.js";
import GetScriptTreeAncestorsTool from "./get/get-script-tree-ancestors.js";
import GetScriptTreeChildrenTool from "./get/get-script-tree-children.js";
import GetScriptTreeRootTool from "./get/get-script-tree-root.js";
import CreateScriptTool from "./post/create-script.js";
import CreateScriptFolderTool from "./post/create-script-folder.js";
import UpdateScriptTool from "./put/update-script.js";
import RenameScriptTool from "./put/rename-script.js";
import DeleteScriptTool from "./delete/delete-script.js";
import DeleteScriptFolderTool from "./delete/delete-script-folder.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const ScriptCollection: ToolCollectionExport = {
  metadata: {
    name: 'script',
    displayName: 'Scripts',
    description: 'JavaScript file management and scripting',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];
    
    if (AuthorizationPolicies.TreeAccessScripts(user)) {
      tools.push(GetScriptByPathTool());
      tools.push(GetScriptFolderByPathTool());
      tools.push(GetScriptItemsTool());
      tools.push(GetScriptTreeAncestorsTool());
      tools.push(GetScriptTreeChildrenTool());
      tools.push(GetScriptTreeRootTool());
      tools.push(CreateScriptTool());
      tools.push(CreateScriptFolderTool());
      tools.push(UpdateScriptTool());
      tools.push(RenameScriptTool());
      tools.push(DeleteScriptTool());
      tools.push(DeleteScriptFolderTool());
    }

    return tools;
  }
};

// Backwards compatibility export
export const ScriptTools = (user: CurrentUserResponseModel) => {
  return ScriptCollection.tools(user);
};