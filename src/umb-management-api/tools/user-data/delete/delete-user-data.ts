import { UmbracoManagementClient } from "@umb-management-client";
import { deleteUserDataByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteUserDataTool = {
  name: "delete-user-data",
  description: "Deletes user data by its id",
  schema: deleteUserDataByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteUserDataById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof deleteUserDataByIdParams.shape>;

export default withStandardDecorators(DeleteUserDataTool);
