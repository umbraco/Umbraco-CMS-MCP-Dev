import { deleteDataTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeleteDataTypeTool = {
  name: "delete-data-type",
  description: "Deletes a data type by Id",
  inputSchema: deleteDataTypeByIdParams.shape,
  annotations: {
    destructiveHint: true,
    idempotentHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) => 
      client.deleteDataTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDataTypeByIdParams.shape>;

export default withStandardDecorators(DeleteDataTypeTool);
