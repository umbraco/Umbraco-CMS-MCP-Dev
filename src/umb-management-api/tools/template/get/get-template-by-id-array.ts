import { GetItemTemplateParams } from "@/umb-management-api/schemas/index.js";
import { getItemTemplateQueryParams, getItemTemplateResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
    return executeGetItemsApiCall((client) =>
      client.getItemTemplate(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemTemplateQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetTemplatesByIdArrayTool);