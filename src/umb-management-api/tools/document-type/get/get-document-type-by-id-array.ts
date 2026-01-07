import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { getItemDocumentTypeQueryParams, getItemDocumentTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemDocumentTypeParams } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

const outputSchema = z.object({
  items: getItemDocumentTypeResponse,
});

const GetDocumentTypesByIdArrayTool = {
  name: "get-document-types-by-id-array",
  description: "Gets document types by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemDocumentTypeQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetItemDocumentTypeParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemDocumentType(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDocumentTypeQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypesByIdArrayTool);
