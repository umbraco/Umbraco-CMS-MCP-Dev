import { UmbracoManagementClient } from "@umb-management-client";
import { deletePartialViewByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeletePartialViewTool = {
  name: "delete-partial-view",
  description: "Deletes a partial view by its path",
  schema: deletePartialViewByPathParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deletePartialViewByPath(model.path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deletePartialViewByPathParams.shape>;

export default withStandardDecorators(DeletePartialViewTool);