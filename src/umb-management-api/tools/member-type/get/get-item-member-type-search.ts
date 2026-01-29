import { getItemMemberTypeSearchQueryParams, getItemMemberTypeSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemMemberTypeSearchParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const SearchMemberTypeItemsTool = {
  name: "search-member-type-items",
  description: "Searches for member type items",
  inputSchema: getItemMemberTypeSearchQueryParams.shape,
  outputSchema: getItemMemberTypeSearchResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (params: GetItemMemberTypeSearchParams) => {
    return executeGetApiCall((client) =>
      client.getItemMemberTypeSearch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMemberTypeSearchQueryParams.shape, typeof getItemMemberTypeSearchResponse.shape>;

export default withStandardDecorators(SearchMemberTypeItemsTool);
