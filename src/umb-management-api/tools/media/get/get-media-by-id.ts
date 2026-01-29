import { getMediaByIdParams, getMediaByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaByIdTool = {
  name: "get-media-by-id",
  description: `Gets a media item by id
  Use this to retrieve existing media items.`,
  inputSchema: getMediaByIdParams.shape,
  outputSchema: getMediaByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getMediaById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMediaByIdParams.shape, typeof getMediaByIdResponse.shape>;

export default withStandardDecorators(GetMediaByIdTool);
