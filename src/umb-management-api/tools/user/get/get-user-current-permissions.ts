import { UmbracoManagementClient } from "@umb-management-client";
import { getUserCurrentPermissionsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetUserCurrentPermissionsParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserCurrentPermissionsTool = {
  name: "get-user-current-permissions",
  description: "Gets the current user's permissions for the specified entity",
  schema: getUserCurrentPermissionsQueryParams.shape,
  isReadOnly: true,
  slices: ['permissions'],
  handler: async (params: GetUserCurrentPermissionsParams) => {
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
  },
} satisfies ToolDefinition<typeof getUserCurrentPermissionsQueryParams.shape>;

export default withStandardDecorators(GetUserCurrentPermissionsTool);