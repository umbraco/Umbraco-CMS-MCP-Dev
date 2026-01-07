import { deleteMediaByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeleteFromRecycleBinTool = {
  name: "delete-media-from-recycle-bin",
  description: "Deletes a media item from the recycle bin by Id.",
  inputSchema: deleteMediaByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'recycle-bin'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteMediaById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteMediaByIdParams.shape>;

export default withStandardDecorators(DeleteFromRecycleBinTool);
