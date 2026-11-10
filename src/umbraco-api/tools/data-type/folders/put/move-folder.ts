import {
  putDataTypeFolderByIdMoveParams,
  putDataTypeFolderByIdMoveBody,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const moveDataTypeFolderSchema = {
  id: putDataTypeFolderByIdMoveParams.shape.id,
  data: z.object(putDataTypeFolderByIdMoveBody.shape),
};

const MoveDataTypeFolderTool = {
  name: "move-data-type-folder",
  description: `Moves a data type folder (and everything inside it) to a new parent folder.
  Set data.target to { id: "<folder-id>" } to move into another data type folder, or to null to move it to the root.`,
  inputSchema: moveDataTypeFolderSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move', 'folders'],
  handler: (async (model: { id: string; data: z.infer<typeof putDataTypeFolderByIdMoveBody> }) => {
    return executeVoidApiCall((client) =>
      client.putDataTypeFolderByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof moveDataTypeFolderSchema>;

export default withStandardDecorators(MoveDataTypeFolderTool);
