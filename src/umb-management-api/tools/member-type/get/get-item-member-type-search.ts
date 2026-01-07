import { getItemMemberTypeSearchQueryParams, getItemMemberTypeSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemMemberTypeSearchParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
