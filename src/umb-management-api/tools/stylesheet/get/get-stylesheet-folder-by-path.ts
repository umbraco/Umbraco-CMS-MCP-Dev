import { getStylesheetFolderByPathParams, getStylesheetFolderByPathResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetStylesheetFolderByPathTool = {
  name: "get-stylesheet-folder-by-path",
  description: "Gets a stylesheet folder by its path",
  inputSchema: getStylesheetFolderByPathParams.shape,
  outputSchema: getStylesheetFolderByPathResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read', 'folders'],
  handler: (async (model: { path: string }) => {
    return executeGetApiCall((client) =>
      client.getStylesheetFolderByPath(model.path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getStylesheetFolderByPathParams.shape, typeof getStylesheetFolderByPathResponse.shape>;

export default withStandardDecorators(GetStylesheetFolderByPathTool);
