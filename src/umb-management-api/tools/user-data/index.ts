import CreateUserDataTool from "./post/create-user-data.js";
import UpdateUserDataTool from "./put/update-user-data.js";
import GetUserDataTool from "./get/get-user-data.js";
import GetUserDataByIdTool from "./get/get-user-data-by-id.js";
import DeleteUserDataTool from "./delete/delete-user-data.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const UserDataCollection: ToolCollectionExport = {
  metadata: {
    name: 'user-data',
    displayName: 'User Data',
    description: 'Personal key-value storage for authenticated users - manage preferences, settings, and application state',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    // User Data is scoped to the authenticated user, available to all authenticated users
    tools.push(CreateUserDataTool);
    tools.push(UpdateUserDataTool);
    tools.push(GetUserDataTool);
    tools.push(GetUserDataByIdTool);
    tools.push(DeleteUserDataTool);

    return tools;
  }
};

// Backwards compatibility export
export const UserDataTools = (user: CurrentUserResponseModel) => {
  return UserDataCollection.tools(user);
};