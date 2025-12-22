import { deleteDataTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const DeleteDataTypeFolderTool = {
  name: "delete-data-type-folder",
  description: "Deletes a data type folder by Id",
  inputSchema: deleteDataTypeFolderByIdParams.shape,
  annotations: {
    destructiveHint: true,
    idempotentHint: true,
  },
  slices: ['delete', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidOperation((client) => 
      client.deleteDataTypeFolderById(id, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof deleteDataTypeFolderByIdParams.shape>;

export default withStandardDecorators(DeleteDataTypeFolderTool);
