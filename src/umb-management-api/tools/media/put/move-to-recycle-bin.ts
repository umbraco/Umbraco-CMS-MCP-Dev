import { putMediaByIdMoveToRecycleBinParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import {
  emptyOutputShape,
  executeVoidApiCallWithEmptyOutput,
  type EmptyOutputShape,
} from "../../shared/execute-void-with-empty-output.js";

const MoveMediaToRecycleBinTool = {
  name: "move-media-to-recycle-bin",
  description: "Move a media item to the recycle bin",
  inputSchema: putMediaByIdMoveToRecycleBinParams.shape,
  outputSchema: emptyOutputShape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move', 'recycle-bin'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putMediaByIdMoveToRecycleBin(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putMediaByIdMoveToRecycleBinParams.shape, EmptyOutputShape>;

export default withStandardDecorators(MoveMediaToRecycleBinTool);
