import { GetTreeDataTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeAncestorsQueryParams, getTreeDataTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDataTypeAncestorsResponse,
});

const GetDataTypeAncestorsTool = {
  name: "get-data-type-ancestors",
  description: "Gets the ancestors of a data type by Id",
  inputSchema: getTreeDataTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: GetTreeDataTypeAncestorsParams) => {
    const result = await executeGetApiCall((client) =>
      client.getTreeDataTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );

    // Wrap the array response in an object
    return {
      ...result,
      structuredContent: {
        items: result.structuredContent,
      },
    };
  }),
} satisfies ToolDefinition<typeof getTreeDataTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDataTypeAncestorsTool);
