import { getItemDataTypeQueryParams, getItemDataTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypesByIdArrayTool = {
  name: "get-data-types-by-id-array",
  description: "Gets data types by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemDataTypeQueryParams.shape,
  outputSchema: getItemDataTypeResponse,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: { id?: string[] }) => {
    return executeGetApiCall((client) =>
      client.getItemDataType(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDataTypeQueryParams.shape, typeof getItemDataTypeResponse>;

export default withStandardDecorators(GetDataTypesByIdArrayTool);
