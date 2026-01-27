import { postIndexerByIndexNameRebuildParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const PostIndexerByIndexNameRebuildTool = {
  name: "post-indexer-by-index-name-rebuild",
  description: `Rebuilds a specific index by name.
  This operation will trigger a full rebuild of the index, which may take some time depending on the amount of content.
  Use this only when asked to by the user.`,
  inputSchema: postIndexerByIndexNameRebuildParams.shape,
  slices: ['diagnostics'],
  handler: (async (model: { indexName: string }) => {
    return executeVoidApiCall((client) =>
      client.postIndexerByIndexNameRebuild(model.indexName, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postIndexerByIndexNameRebuildParams.shape>;

export default withStandardDecorators(PostIndexerByIndexNameRebuildTool);
