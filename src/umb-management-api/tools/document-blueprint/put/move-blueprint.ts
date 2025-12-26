import { MoveDocumentBlueprintRequestModel } from "@/umb-management-api/schemas/moveDocumentBlueprintRequestModel.js";
import {
  putDocumentBlueprintByIdMoveParams,
  putDocumentBlueprintByIdMoveBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const moveDocumentBlueprintSchema = z.object({
  id: putDocumentBlueprintByIdMoveParams.shape.id,
  data: z.object(putDocumentBlueprintByIdMoveBody.shape),
});

type MoveDocumentBlueprintParams = z.infer<typeof moveDocumentBlueprintSchema>;

const MoveDocumentBlueprintTool = {
  name: "move-document-blueprint",
  description: "Moves a document blueprint by Id",
  inputSchema: moveDocumentBlueprintSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['move'],
  handler: (async (model: MoveDocumentBlueprintParams) => {
    return executeVoidApiCall((client) =>
      client.putDocumentBlueprintByIdMove(
        model.id,
        model.data as MoveDocumentBlueprintRequestModel,
        CAPTURE_RAW_HTTP_RESPONSE
      )
    );
  }),
} satisfies ToolDefinition<typeof moveDocumentBlueprintSchema.shape>;

export default withStandardDecorators(MoveDocumentBlueprintTool);
