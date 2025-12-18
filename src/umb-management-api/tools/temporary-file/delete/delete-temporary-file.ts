import { UmbracoManagementClient } from "@umb-management-client";
import { deleteTemporaryFileByIdParams } from "@/umb-management-api/temporary-file/types.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteTemporaryFileTool = {
  name: "delete-temporary-file",
  description: "Deletes a temporary file by Id",
  schema: deleteTemporaryFileByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    await client.deleteTemporaryFileById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ id }),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof deleteTemporaryFileByIdParams.shape>;

export default withStandardDecorators(DeleteTemporaryFileTool);
