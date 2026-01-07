import { getItemDataTypeQueryParams, getItemDataTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

const outputSchema = z.object({
  items: getItemDataTypeResponse,
});

const GetDataTypesByIdArrayTool = {
  name: "get-data-types-by-id-array",
  description: "Gets data types by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemDataTypeQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: { id?: string[] }) => {
    return executeGetItemsApiCall((client) =>
      client.getItemDataType(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDataTypeQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDataTypesByIdArrayTool);
