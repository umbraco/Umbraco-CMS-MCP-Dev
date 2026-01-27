import { deleteMediaByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteMediaTool = {
  name: "delete-media",
  description: "Deletes a media item by Id. Works for all media types including folders, images, files, videos, etc.",
  inputSchema: deleteMediaByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteMediaById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteMediaByIdParams.shape>;

export default withStandardDecorators(DeleteMediaTool);
