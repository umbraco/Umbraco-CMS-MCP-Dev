import { UmbracoManagementClient } from "@umb-management-client";
import { getUserCurrentPermissionsDocumentQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetUserCurrentPermissionsDocumentParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserCurrentPermissionsDocumentTool = {
  name: "get-user-current-permissions-document",
  description: "Gets the current user's document permissions for specific documents",
  schema: getUserCurrentPermissionsDocumentQueryParams.shape,
  isReadOnly: true,
  slices: ['permissions'],
  handler: async (params: GetUserCurrentPermissionsDocumentParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrentPermissionsDocument(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getUserCurrentPermissionsDocumentQueryParams.shape>;

export default withStandardDecorators(GetUserCurrentPermissionsDocumentTool);