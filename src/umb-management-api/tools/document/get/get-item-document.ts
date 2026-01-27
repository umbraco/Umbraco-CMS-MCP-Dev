import { getItemDocumentQueryParams, getItemDocumentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemDocumentResponse,
});

const GetItemDocumentTool = {
  name: "get-item-document",
  description: "Gets document items by their ids",
  inputSchema: getItemDocumentQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: z.infer<typeof getItemDocumentQueryParams>) => {
    return executeGetItemsApiCall((client) =>
      client.getItemDocument(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDocumentQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetItemDocumentTool);
