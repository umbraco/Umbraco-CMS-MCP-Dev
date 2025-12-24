import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { getItemDocumentTypeSearchQueryParams, getItemDocumentTypeSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemDocumentTypeSearchParams } from "@/umb-management-api/schemas/index.js";

const SearchDocumentTypeTool = {
  name: "search-document-type",
  description: "Search for document types by name",
  inputSchema: getItemDocumentTypeSearchQueryParams.shape,
  outputSchema: getItemDocumentTypeSearchResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (model: GetItemDocumentTypeSearchParams) => {
    return executeGetApiCall((client) =>
      client.getItemDocumentTypeSearch(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDocumentTypeSearchQueryParams.shape, typeof getItemDocumentTypeSearchResponse.shape>;

export default withStandardDecorators(SearchDocumentTypeTool);
