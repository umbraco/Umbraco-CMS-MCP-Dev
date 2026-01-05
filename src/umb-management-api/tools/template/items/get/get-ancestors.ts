import { GetTreeTemplateAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeTemplateAncestorsQueryParams, getTreeTemplateAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getTreeTemplateAncestorsResponse,
});

const GetTemplateAncestorsTool = {
  name: "get-template-ancestors",
  description: "Gets the ancestors of a template by Id",
  inputSchema: getTreeTemplateAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeTemplateAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeTemplateAncestors(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreeTemplateAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetTemplateAncestorsTool);
