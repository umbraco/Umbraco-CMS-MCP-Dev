import { getIndexerQueryParams, getIndexerResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetIndexerParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetIndexerTool = {
  name: "get-indexer",
  description: `Lists all indexes with pagination support.
  Returns an object containing:
  - total: Total number of indexes (number)
  - items: Array of index objects with name, searcherName, and other properties`,
  inputSchema: getIndexerQueryParams.shape,
  outputSchema: getIndexerResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (model: GetIndexerParams) => {
    return executeGetApiCall((client) =>
      client.getIndexer(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getIndexerQueryParams.shape, typeof getIndexerResponse.shape>;

export default withStandardDecorators(GetIndexerTool);
