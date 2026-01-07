import { GetTreeScriptAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeScriptAncestorsQueryParams, getTreeScriptAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
