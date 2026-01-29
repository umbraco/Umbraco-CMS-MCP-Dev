import { GetTreeStylesheetAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetAncestorsQueryParams, getTreeStylesheetAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
 
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getTreeStylesheetAncestorsResponse,
});

const GetStylesheetAncestorsTool = {
  name: "get-stylesheet-ancestors",
  description: "Gets the ancestors of a stylesheet in the tree structure",
  inputSchema: getTreeStylesheetAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreeStylesheetAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeStylesheetAncestors(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeStylesheetAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetStylesheetAncestorsTool);
