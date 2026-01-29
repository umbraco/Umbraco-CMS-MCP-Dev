import { getPartialViewFolderByPathParams, getPartialViewFolderByPathResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetPartialViewFolderByPathTool = {
  name: "get-partial-view-folder-by-path",
  description: "Gets a partial view folder by its path",
  inputSchema: getPartialViewFolderByPathParams.shape,
  outputSchema: getPartialViewFolderByPathResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read', 'folders'],
  handler: (async ({ path }: { path: string }) => {
    return executeGetApiCall((client) =>
      client.getPartialViewFolderByPath(path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getPartialViewFolderByPathParams.shape, typeof getPartialViewFolderByPathResponse.shape>;

export default withStandardDecorators(GetPartialViewFolderByPathTool);