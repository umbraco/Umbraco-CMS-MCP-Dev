import GetStaticFilesTool from "./items/get/get-static-files.js";
import GetStaticFileRootTool from "./items/get/get-root.js";
import GetStaticFileChildrenTool from "./items/get/get-children.js";
import GetStaticFileAncestorsTool from "./items/get/get-ancestors.js";

import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const StaticFileCollection: ToolCollectionExport = {
  metadata: {
    name: 'static-file',
    displayName: 'Static Files',
    description: 'Read-only access to static files and folders in the Umbraco file system',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    tools.push(GetStaticFilesTool());
    tools.push(GetStaticFileRootTool());
    tools.push(GetStaticFileChildrenTool());
    tools.push(GetStaticFileAncestorsTool());

    return tools;
  }
};

// Backwards compatibility export
export const StaticFileTools = (user: CurrentUserResponseModel) => {
  return StaticFileCollection.tools(user);
};