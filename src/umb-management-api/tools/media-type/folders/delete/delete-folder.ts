import { deleteMediaTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeleteMediaTypeFolderTool = {
  name: "delete-media-type-folder",
  description: "Deletes a media type folder by Id",
  inputSchema: deleteMediaTypeFolderByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteMediaTypeFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteMediaTypeFolderByIdParams.shape>;

export default withStandardDecorators(DeleteMediaTypeFolderTool);
