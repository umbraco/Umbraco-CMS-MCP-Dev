import { GetItemTemplateSearchParams } from "@/umb-management-api/schemas/index.js";
import { getItemTemplateSearchQueryParams, getItemTemplateSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateSearchTool = {
  name: "get-template-search",
  description: "Searches the template tree for a template by name. It does NOT allow for searching for template folders.",
  inputSchema: getItemTemplateSearchQueryParams.shape,
  outputSchema: getItemTemplateSearchResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (params: GetItemTemplateSearchParams) => {
    return executeGetApiCall((client) =>
      client.getItemTemplateSearch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemTemplateSearchQueryParams.shape, typeof getItemTemplateSearchResponse.shape>;

export default withStandardDecorators(GetTemplateSearchTool);
