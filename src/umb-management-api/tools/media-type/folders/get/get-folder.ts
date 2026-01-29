import { getMediaTypeFolderByIdParams, getMediaTypeFolderByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaTypeFolderTool = {
  name: "get-media-type-folder",
  description: "Gets a media type folder by Id",
  inputSchema: getMediaTypeFolderByIdParams.shape,
  outputSchema: getMediaTypeFolderByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getMediaTypeFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMediaTypeFolderByIdParams.shape, typeof getMediaTypeFolderByIdResponse.shape>;

export default withStandardDecorators(GetMediaTypeFolderTool);
