import {
  putMediaTypeFolderByIdMoveParams,
  putMediaTypeFolderByIdMoveBody,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const moveMediaTypeFolderSchema = {
  id: putMediaTypeFolderByIdMoveParams.shape.id,
  data: z.object(putMediaTypeFolderByIdMoveBody.shape),
};

const MoveMediaTypeFolderTool = {
  name: "move-media-type-folder",
  description: `Moves a media type folder (and everything inside it) to a new parent folder.
  Set data.target to { id: "<folder-id>" } to move into another media type folder, or to null to move it to the root.`,
  inputSchema: moveMediaTypeFolderSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move', 'folders'],
  handler: (async (model: { id: string; data: z.infer<typeof putMediaTypeFolderByIdMoveBody> }) => {
    return executeVoidApiCall((client) =>
      client.putMediaTypeFolderByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof moveMediaTypeFolderSchema>;

export default withStandardDecorators(MoveMediaTypeFolderTool);
