import { getTreeElementAncestorsQueryParams, getTreeElementAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getTreeElementAncestorsResponse,
});

const GetElementAncestorsTool = {
  name: "get-element-ancestors",
  description: "Gets ancestor items for an element.",
  inputSchema: getTreeElementAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: z.infer<typeof getTreeElementAncestorsQueryParams>) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeElementAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeElementAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetElementAncestorsTool);
