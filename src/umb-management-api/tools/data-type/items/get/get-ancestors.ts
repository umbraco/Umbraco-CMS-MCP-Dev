import { GetTreeDataTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDataTypeAncestorsQueryParams, getTreeDataTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
    return executeGetItemsApiCall((client) =>
      client.getTreeDataTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDataTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDataTypeAncestorsTool);
