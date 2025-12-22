import { getDataTypeByIdParams, getDataTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeTool = {
  name: "get-data-type",
  description: "Gets a data type by Id",
  inputSchema: getDataTypeByIdParams.shape,
  outputSchema: getDataTypeByIdResponse.shape,
  annotations: {
    readOnlyHint: true
  },
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    return executeGetOperation((client) => 
      client.getDataTypeById(id, FULL_RESPONSE_OPTIONS)
    );
  },
} satisfies ToolDefinition<typeof getDataTypeByIdParams.shape, typeof getDataTypeByIdResponse.shape>;

export default withStandardDecorators(GetDataTypeTool);
