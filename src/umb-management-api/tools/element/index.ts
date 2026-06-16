import GetElementByIdTool from "./get/get-element-by-id.js";
import DeleteElementTool from "./delete/delete-element.js";
import MoveElementTool from "./put/move-element.js";
import GetElementRootTool from "./items/get/get-element-root.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const ElementCollection: ToolCollectionExport = {
  metadata: {
    name: 'element',
    displayName: 'Elements',
    description: 'Element content management and publishing',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.TreeAccessElements(user)) {
      tools.push(GetElementByIdTool);
      tools.push(DeleteElementTool);
      tools.push(MoveElementTool);
      tools.push(GetElementRootTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const ElementTools = (user: CurrentUserResponseModel) => {
  return ElementCollection.tools(user);
};
