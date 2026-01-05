import { GetTreeStylesheetAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetAncestorsQueryParams, getTreeStylesheetAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeStylesheetAncestors(model);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreeStylesheetAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetStylesheetAncestorsTool);
