import { getItemDataTypeQueryParams, getItemDataTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
    const result = await executeGetApiCall((client) =>
      client.getItemDataType(params, CAPTURE_RAW_HTTP_RESPONSE)
    );

    // Wrap the array response in an object
    return {
      ...result,
      structuredContent: {
        items: result.structuredContent,
      },
    };
  }),
} satisfies ToolDefinition<typeof getItemDataTypeQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDataTypesByIdArrayTool);
