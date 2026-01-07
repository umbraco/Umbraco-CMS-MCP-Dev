import { getIndexerByIndexNameParams, getIndexerByIndexNameResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetIndexerByIndexNameTool = {
  name: "get-indexer-by-index-name",
  description: `Gets a specific index by its name.
  Returns detailed information about the index including its configuration and status.`,
  inputSchema: getIndexerByIndexNameParams.shape,
  outputSchema: getIndexerByIndexNameResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (model: { indexName: string }) => {
    return executeGetApiCall((client) =>
      client.getIndexerByIndexName(model.indexName, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getIndexerByIndexNameParams.shape, typeof getIndexerByIndexNameResponse.shape>;

export default withStandardDecorators(GetIndexerByIndexNameTool);
