import { deleteRecycleBinMediaByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteMediaRecycleBinItemTool = {
  name: "delete-media-recycle-bin-item",
  description: "Permanently deletes a media item from the recycle bin by its id",
  inputSchema: deleteRecycleBinMediaByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'recycle-bin'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteRecycleBinMediaById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteRecycleBinMediaByIdParams.shape>;

export default withStandardDecorators(DeleteMediaRecycleBinItemTool);
