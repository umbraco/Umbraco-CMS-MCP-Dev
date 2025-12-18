import { UmbracoManagementClient } from "@umb-management-client";
import { deleteRedirectManagementByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteRedirectTool = {
  name: "delete-redirect",
  description: `Deletes a specific redirect by its ID.
  Parameters:
  - id: The unique identifier of the redirect to delete (string)

  Returns no content on success.`,
  schema: deleteRedirectManagementByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    await client.deleteRedirectManagementById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: "Redirect deleted successfully",
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteRedirectManagementByIdParams.shape>;

export default withStandardDecorators(DeleteRedirectTool);
