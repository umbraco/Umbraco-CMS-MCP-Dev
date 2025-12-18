import { UmbracoManagementClient } from "@umb-management-client";
import { deleteStylesheetByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteStylesheetTool = {
  name: "delete-stylesheet",
  description: "Deletes a stylesheet by its path",
  schema: deleteStylesheetByPathParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteStylesheetByPath(model.path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof deleteStylesheetByPathParams.shape>;

export default withStandardDecorators(DeleteStylesheetTool);