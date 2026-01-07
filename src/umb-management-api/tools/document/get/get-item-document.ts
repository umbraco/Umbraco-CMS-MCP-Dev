import { getItemDocumentQueryParams, getItemDocumentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
