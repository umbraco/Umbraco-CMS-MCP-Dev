import {
  putDocumentBlueprintFolderByIdMoveParams,
  putDocumentBlueprintFolderByIdMoveBody,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const moveDocumentBlueprintFolderSchema = {
  id: putDocumentBlueprintFolderByIdMoveParams.shape.id,
  data: z.object(putDocumentBlueprintFolderByIdMoveBody.shape),
};

const MoveDocumentBlueprintFolderTool = {
  name: "move-document-blueprint-folder",
  description: `Moves a document blueprint folder (and everything inside it) to a new parent folder.
  Set data.target to { id: "<folder-id>" } to move into another document blueprint folder, or to null to move it to the root.`,
  inputSchema: moveDocumentBlueprintFolderSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['move', 'folders'],
  handler: (async (model: { id: string; data: z.infer<typeof putDocumentBlueprintFolderByIdMoveBody> }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentBlueprintFolderByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof moveDocumentBlueprintFolderSchema>;

export default withStandardDecorators(MoveDocumentBlueprintFolderTool);
