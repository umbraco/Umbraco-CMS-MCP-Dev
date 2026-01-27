import { deleteTemporaryFileByIdParams } from "@/umb-management-api/temporary-file/types.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteTemporaryFileTool = {
  name: "delete-temporary-file",
  description: "Deletes a temporary file by Id",
  inputSchema: deleteTemporaryFileByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteTemporaryFileById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteTemporaryFileByIdParams.shape>;

export default withStandardDecorators(DeleteTemporaryFileTool);
