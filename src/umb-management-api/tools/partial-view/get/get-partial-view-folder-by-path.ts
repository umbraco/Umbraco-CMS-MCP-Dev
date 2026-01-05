import { getPartialViewFolderByPathParams, getPartialViewFolderByPathResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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