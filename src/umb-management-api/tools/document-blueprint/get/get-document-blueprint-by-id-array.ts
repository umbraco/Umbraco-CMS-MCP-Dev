import { GetItemDocumentBlueprintParams } from "@/umb-management-api/schemas/index.js";
import { getItemDocumentBlueprintQueryParams, getItemDocumentBlueprintResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemDocumentBlueprintResponse,
});

const GetDocumentBlueprintByIdArrayTool = {
  name: "get-document-blueprint-by-id-array",
  description: "Gets document blueprints by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemDocumentBlueprintQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetItemDocumentBlueprintParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemDocumentBlueprint(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDocumentBlueprintQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentBlueprintByIdArrayTool);
