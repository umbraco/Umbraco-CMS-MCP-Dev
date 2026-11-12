import {
  putDocumentTypeFolderByIdMoveParams,
  putDocumentTypeFolderByIdMoveBody,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const moveDocumentTypeFolderSchema = {
  id: putDocumentTypeFolderByIdMoveParams.shape.id,
  data: z.object(putDocumentTypeFolderByIdMoveBody.shape),
};

const MoveDocumentTypeFolderTool = {
  name: "move-document-type-folder",
  description: `Moves a document type folder (and everything inside it) to a new parent folder.
  Set data.target to { id: "<folder-id>" } to move into another document type folder, or to null to move it to the root.`,
  inputSchema: moveDocumentTypeFolderSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move', 'folders'],
  handler: (async (model: { id: string; data: z.infer<typeof putDocumentTypeFolderByIdMoveBody> }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentTypeFolderByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof moveDocumentTypeFolderSchema>;

export default withStandardDecorators(MoveDocumentTypeFolderTool);
