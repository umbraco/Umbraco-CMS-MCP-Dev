import { GetItemStylesheetParams } from "@/umb-management-api/schemas/index.js";
import { getItemStylesheetQueryParams, getItemStylesheetResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
    return executeGetItemsApiCall((client) =>
      client.getItemStylesheet(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemStylesheetQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetStylesheetSearchTool);
