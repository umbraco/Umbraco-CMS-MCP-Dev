import GetUserGroupTool from "./get/get-user-group.js";
import GetUserGroupByIdArrayTool from "./get/get-user-group-by-id-array.js";
import GetUserGroupsTool from "./get/get-user-groups.js";
import GetFilterUserGroupTool from "./get/get-filter-user-group.js";
import CreateUserGroupTool from "./post/create-user-group.js";
import UpdateUserGroupTool from "./put/update-user-group.js";
import DeleteUserGroupTool from "./delete/delete-user-group.js";
import DeleteUserGroupsTool from "./delete/delete-user-groups.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const UserGroupCollection: ToolCollectionExport = {
  metadata: {
    name: 'user-group',
    displayName: 'User Groups',
    description: 'User group management and permissions',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.SectionAccessUsers(user)) {
      tools.push(GetUserGroupByIdArrayTool);
      tools.push(GetUserGroupsTool);
      tools.push(GetFilterUserGroupTool);
      tools.push(CreateUserGroupTool);
      tools.push(UpdateUserGroupTool);
      tools.push(DeleteUserGroupTool);
      tools.push(DeleteUserGroupsTool);
    }

    tools.push(GetUserGroupTool);
    return tools;
  }
};

// Backwards compatibility export
export const UserGroupTools = (user: CurrentUserResponseModel) => {
  return UserGroupCollection.tools(user);
}; 