import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserCurrentPermissionsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserCurrentPermissionsTool = CreateUmbracoTool(
  "get-user-current-permissions",
  "Gets the current user's permissions for the specified entity",
  getUserCurrentPermissionsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrentPermissions(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
);

export default GetUserCurrentPermissionsTool;