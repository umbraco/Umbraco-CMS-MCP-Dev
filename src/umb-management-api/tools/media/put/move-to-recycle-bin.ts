import { putMediaByIdMoveToRecycleBinParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const MoveMediaToRecycleBinTool = {
  name: "move-media-to-recycle-bin",
  description: "Move a media item to the recycle bin",
  inputSchema: putMediaByIdMoveToRecycleBinParams.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move', 'recycle-bin'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.putMediaByIdMoveToRecycleBin(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putMediaByIdMoveToRecycleBinParams.shape>;

export default withStandardDecorators(MoveMediaToRecycleBinTool);
