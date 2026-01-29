import { MoveDocumentBlueprintRequestModel } from "@/umb-management-api/schemas/moveDocumentBlueprintRequestModel.js";
import {
  putDocumentBlueprintByIdMoveParams,
  putDocumentBlueprintByIdMoveBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const moveDocumentBlueprintSchema = z.object({
  id: putDocumentBlueprintByIdMoveParams.shape.id,
  data: z.object(putDocumentBlueprintByIdMoveBody.shape),
});

type MoveDocumentBlueprintParams = z.infer<typeof moveDocumentBlueprintSchema>;

const MoveDocumentBlueprintTool = {
  name: "move-document-blueprint",
  description: "Moves a document blueprint by Id",
  inputSchema: moveDocumentBlueprintSchema.shape,
  annotations: {},
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
