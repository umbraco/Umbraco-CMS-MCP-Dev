import { MoveDocumentTypeRequestModel } from "@/umb-management-api/schemas/moveDocumentTypeRequestModel.js";
import {
  putDocumentTypeByIdMoveParams,
  putDocumentTypeByIdMoveBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const moveDocumentTypeSchema = {
  id: putDocumentTypeByIdMoveParams.shape.id,
  data: z.object(putDocumentTypeByIdMoveBody.shape),
};

const MoveDocumentTypeTool = {
  name: "move-document-type",
  description: "Move a document type to a new location",
  inputSchema: moveDocumentTypeSchema,
  slices: ['move'],
  handler: (async (model: { id: string; data: MoveDocumentTypeRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentTypeByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof moveDocumentTypeSchema>;

export default withStandardDecorators(MoveDocumentTypeTool);
