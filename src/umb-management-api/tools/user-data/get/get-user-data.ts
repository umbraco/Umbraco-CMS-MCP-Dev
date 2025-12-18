import { UmbracoManagementClient } from "@umb-management-client";
import { getUserDataQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetUserDataParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserDataTool = {
  name: "get-user-data",
  description: "Retrieves user data records with pagination and filtering",
  schema: getUserDataQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (params: GetUserDataParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserData(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getUserDataQueryParams.shape>;

export default withStandardDecorators(GetUserDataTool);