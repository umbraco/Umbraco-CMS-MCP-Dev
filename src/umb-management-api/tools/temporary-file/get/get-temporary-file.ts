import { getTemporaryFileByIdParams, getTemporaryFileByIdResponse } from "@/umb-management-api/temporary-file/types.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetTemporaryFileTool = {
  name: "get-temporary-file",
  description: "Gets a temporary file by id",
  inputSchema: getTemporaryFileByIdParams.shape,
  outputSchema: getTemporaryFileByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getTemporaryFileById(params.id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTemporaryFileByIdParams.shape, typeof getTemporaryFileByIdResponse.shape>;

export default withStandardDecorators(GetTemporaryFileTool);
