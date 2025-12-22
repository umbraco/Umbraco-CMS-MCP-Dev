import { GetItemDataTypeSearchParams } from "@/umb-management-api/schemas/index.js";
import { getItemDataTypeSearchQueryParams, getItemDataTypeSearchResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeSearchTool = {
  name: "get-data-type-search",
  description: "Searches the data type tree for a data type by name. It does NOT allow for searching for data type folders.",
  inputSchema: getItemDataTypeSearchQueryParams.shape,
  outputSchema: getItemDataTypeSearchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['search'],
  handler: (async (params: GetItemDataTypeSearchParams) => {
    return executeGetOperation((client) =>
      client.getItemDataTypeSearch(params, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof getItemDataTypeSearchQueryParams.shape, typeof getItemDataTypeSearchResponse.shape>;

export default withStandardDecorators(GetDataTypeSearchTool);
