import { UmbracoManagementClient } from "@umb-management-client";
import { deleteDictionaryByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteDictionaryItemTool = {
  name: "delete-dictionary-item",
  description: "Deletes a dictionary item by Id",
  schema: deleteDictionaryByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteDictionaryById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteDictionaryByIdParams.shape>;

export default withStandardDecorators(DeleteDictionaryItemTool);
