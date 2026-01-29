import { GetTreeScriptAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptAncestorsQueryParams, getTreeScriptAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResult,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getTreeScriptAncestorsResponse,
});

const GetScriptTreeAncestorsTool = {
  name: "get-script-tree-ancestors",
  description: "Gets script tree ancestors",
  inputSchema: getTreeScriptAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreeScriptAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeScriptAncestors(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeScriptAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetScriptTreeAncestorsTool);
