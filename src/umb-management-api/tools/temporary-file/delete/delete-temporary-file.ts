import { deleteTemporaryFileByIdParams } from "@/umb-management-api/temporary-file/types.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
