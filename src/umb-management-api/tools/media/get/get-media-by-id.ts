import { getMediaByIdParams, getMediaByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
