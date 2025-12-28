import { deleteDataTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeleteDataTypeFolderTool = {
  name: "delete-data-type-folder",
  description: "Deletes a data type folder by Id",
  inputSchema: deleteDataTypeFolderByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) => 
      client.deleteDataTypeFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDataTypeFolderByIdParams.shape>;

export default withStandardDecorators(DeleteDataTypeFolderTool);
