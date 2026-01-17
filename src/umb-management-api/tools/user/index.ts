import GetUserTool from "./get/get-user.js";
import GetUserByIdTool from "./get/get-user-by-id.js";
import FindUserTool from "./get/find-user.js";
import GetItemUserTool from "./get/get-item-user.js";
import GetUserCurrentTool from "./get/get-user-current.js";
import GetUserConfigurationTool from "./get/get-user-configuration.js";
import GetUserCurrentConfigurationTool from "./get/get-user-current-configuration.js";
import GetUserCurrentLoginProvidersTool from "./get/get-user-current-login-providers.js";
import GetUserCurrentPermissionsTool from "./get/get-user-current-permissions.js";
import GetUserCurrentPermissionsDocumentTool from "./get/get-user-current-permissions-document.js";
import GetUserCurrentPermissionsMediaTool from "./get/get-user-current-permissions-media.js";
import GetUserByIdCalculateStartNodesTool from "./get/get-user-by-id-calculate-start-nodes.js";
import UploadUserAvatarByIdTool from "./post/upload-user-avatar-by-id.js";
import UploadUserCurrentAvatarTool from "./post/upload-user-current-avatar.js";
import DeleteUserAvatarByIdTool from "./delete/delete-user-avatar-by-id.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import {
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const UserCollection: ToolCollectionExport = {
  metadata: {
    name: 'user',
    displayName: 'Users',
    description: 'User account management and administration',
    dependencies: ['temporary-file']
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    // Self-service tools (available to all authenticated users)
    tools.push(GetUserCurrentTool);
    tools.push(GetUserCurrentConfigurationTool);
    tools.push(GetUserCurrentLoginProvidersTool);
    tools.push(GetUserCurrentPermissionsTool);
    tools.push(GetUserCurrentPermissionsDocumentTool);
    tools.push(GetUserCurrentPermissionsMediaTool);
    tools.push(UploadUserCurrentAvatarTool);

    // Administrative tools (require SectionAccessUsers permission)
    if (AuthorizationPolicies.SectionAccessUsers(user)) {
      tools.push(GetUserTool);
      tools.push(GetUserByIdTool);
      tools.push(FindUserTool);
      tools.push(GetItemUserTool);
      tools.push(GetUserConfigurationTool);
      tools.push(GetUserByIdCalculateStartNodesTool);
      tools.push(UploadUserAvatarByIdTool);
      tools.push(DeleteUserAvatarByIdTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const UserTools = (user: CurrentUserResponseModel) => {
  return UserCollection.tools(user);
};