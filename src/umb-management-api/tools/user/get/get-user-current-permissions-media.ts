import { UmbracoManagementClient } from "@umb-management-client";
import { getUserCurrentPermissionsMediaQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetUserCurrentPermissionsMediaParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserCurrentPermissionsMediaTool = {
  name: "get-user-current-permissions-media",
  description: "Gets the current user's media permissions for specific media items",
  schema: getUserCurrentPermissionsMediaQueryParams.shape,
  isReadOnly: true,
  slices: ['permissions'],
  handler: async (params: GetUserCurrentPermissionsMediaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrentPermissionsMedia(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getUserCurrentPermissionsMediaQueryParams.shape>;

export default withStandardDecorators(GetUserCurrentPermissionsMediaTool);