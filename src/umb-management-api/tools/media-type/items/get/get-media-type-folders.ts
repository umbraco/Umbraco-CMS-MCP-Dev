import { GetItemMediaTypeFoldersParams } from "@/umb-management-api/schemas/index.js";
import { getItemMediaTypeFoldersQueryParams, getItemMediaTypeFoldersResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaTypeFoldersTool = {
  name: "get-media-type-folders",
  description: "Lists media type folders with pagination support",
  inputSchema: getItemMediaTypeFoldersQueryParams.shape,
  outputSchema: getItemMediaTypeFoldersResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list', 'folders'],
  handler: (async (params: GetItemMediaTypeFoldersParams) => {
    return executeGetApiCall((client) =>
      client.getItemMediaTypeFolders(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMediaTypeFoldersQueryParams.shape, typeof getItemMediaTypeFoldersResponse.shape>;

export default withStandardDecorators(GetMediaTypeFoldersTool);
