import { GetTreeDocumentTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeAncestorsQueryParams, getTreeDocumentTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetItemsApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/index.js";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDocumentTypeAncestorsResponse,
});

const GetDocumentTypeAncestorsTool = {
  name: "get-document-type-ancestors",
  description: "Gets the ancestors of a document type",
  inputSchema: getTreeDocumentTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentTypeAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeDocumentTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeAncestorsTool);
