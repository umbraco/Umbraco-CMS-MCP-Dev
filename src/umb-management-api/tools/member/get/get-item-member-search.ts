import { GetItemMemberSearchParams } from "@/umb-management-api/schemas/index.js";
import { getItemMemberSearchQueryParams, getItemMemberSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetItemMemberSearchTool = {
  name: "get-item-member-search",
  description: `Searches for member items`,
  inputSchema: getItemMemberSearchQueryParams.shape,
  outputSchema: getItemMemberSearchResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (model: GetItemMemberSearchParams) => {
    return executeGetApiCall((client) =>
      client.getItemMemberSearch(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMemberSearchQueryParams.shape, typeof getItemMemberSearchResponse.shape>;

export default withStandardDecorators(GetItemMemberSearchTool);
