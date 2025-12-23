import { GetFilterDataTypeParams } from "@/umb-management-api/schemas/index.js";
import { getFilterDataTypeQueryParams, getFilterDataTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const FindDataTypeTool = {
  name: "find-data-type",
  description: "Finds a data type by Id or Name",
  inputSchema: getFilterDataTypeQueryParams.shape,
  outputSchema: getFilterDataTypeResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['search'],
  handler: (async (model: GetFilterDataTypeParams) => {
    return executeGetApiCall((client) => 
      client.getFilterDataType(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getFilterDataTypeQueryParams.shape, typeof getFilterDataTypeResponse.shape>;

export default withStandardDecorators(FindDataTypeTool);
