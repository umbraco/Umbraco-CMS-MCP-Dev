import { deleteDataTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

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
    return executeVoidOperation((client) => 
      client.deleteDataTypeById(id, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof deleteDataTypeByIdParams.shape>;

export default withStandardDecorators(DeleteDataTypeTool);
