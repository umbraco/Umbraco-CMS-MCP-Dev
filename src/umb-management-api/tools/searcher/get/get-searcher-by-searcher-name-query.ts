import { getSearcherBySearcherNameQueryParams, getSearcherBySearcherNameQueryQueryParams, getSearcherBySearcherNameQueryResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetSearcherBySearcherNameQueryParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Combine both parameter schemas for the tool
const combinedSchema = getSearcherBySearcherNameQueryParams.merge(getSearcherBySearcherNameQueryQueryParams);

const GetSearcherBySearcherNameQueryTool = {
  name: "get-searcher-by-searcher-name-query",
  description: `Gets search results from a specific searcher by name with query parameters.
  Returns search results from the specified searcher with pagination support.`,
  inputSchema: combinedSchema.shape,
  outputSchema: getSearcherBySearcherNameQueryResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (model: { searcherName: string } & GetSearcherBySearcherNameQueryParams) => {
    const { searcherName, ...queryParams } = model;
    return executeGetApiCall((client) =>
      client.getSearcherBySearcherNameQuery(searcherName, queryParams, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof combinedSchema.shape, typeof getSearcherBySearcherNameQueryResponse.shape>;

export default withStandardDecorators(GetSearcherBySearcherNameQueryTool);
