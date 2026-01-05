import { GetItemTemplateParams } from "@/umb-management-api/schemas/index.js";
import { getItemTemplateQueryParams, getItemTemplateResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getItemTemplateResponse,
});

const GetTemplatesByIdArrayTool = {
  name: "get-templates-by-id-array",
  description: "Gets templates by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemTemplateQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetItemTemplateParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemTemplate(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemTemplateQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetTemplatesByIdArrayTool);