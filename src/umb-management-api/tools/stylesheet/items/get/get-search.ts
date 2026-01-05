import { GetItemStylesheetParams } from "@/umb-management-api/schemas/index.js";
import { getItemStylesheetQueryParams, getItemStylesheetResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getItemStylesheetResponse,
});

const GetStylesheetSearchTool = {
  name: "get-stylesheet-search",
  description: "Searches for stylesheets by name or path",
  inputSchema: getItemStylesheetQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (model: GetItemStylesheetParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemStylesheet(model);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemStylesheetQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetStylesheetSearchTool);
