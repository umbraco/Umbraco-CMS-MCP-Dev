import { putSearchRebuildQueryParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const RebuildSearchIndexTool = {
  name: "rebuild-search-index",
  description: `Triggers a rebuild of a search index.
  Pass indexAlias to rebuild a single index (see get-search-indexes for aliases). Omitting indexAlias rebuilds ALL indexes.
  The rebuild runs in the background and may take some time depending on the amount of content; poll get-search-index to watch healthStatus.
  Use this only when asked to by the user.`,
  inputSchema: putSearchRebuildQueryParams.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (model: { indexAlias?: string }) => {
    return executeVoidApiCall((client) =>
      client.putSearchRebuild(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putSearchRebuildQueryParams.shape>;

export default withStandardDecorators(RebuildSearchIndexTool);
