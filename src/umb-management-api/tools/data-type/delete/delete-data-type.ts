import { UmbracoManagementClient } from "@umb-management-client";
import { deleteDataTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteDataTypeTool = {
  name: "delete-data-type",
  description: "Deletes a data type by Id",
  schema: deleteDataTypeByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteDataTypeById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteDataTypeByIdParams.shape>;

export default withStandardDecorators(DeleteDataTypeTool);
