import { UmbracoManagementClient } from "@umb-management-client";
import { getUserDataByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetUserDataByIdTool = {
  name: "get-user-data-by-id",
  description: "Retrieves a specific personal key-value storage record by its unique identifier for the authenticated user. User data stores user preferences, settings, and configuration values that persist permanently and are organized by group (category) and identifier (key).",
  schema: getUserDataByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserDataById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getUserDataByIdParams.shape>;

export default withStandardDecorators(GetUserDataByIdTool);