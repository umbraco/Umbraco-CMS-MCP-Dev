import { UpdateDocumentBlueprintRequestModel } from "@/umb-management-api/schemas/updateDocumentBlueprintRequestModel.js";
import {
  putDocumentBlueprintByIdParams,
  putDocumentBlueprintByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const updateDocumentBlueprintSchema = z.object({
  id: putDocumentBlueprintByIdParams.shape.id,
  data: z.object(putDocumentBlueprintByIdBody.shape),
});

type UpdateDocumentBlueprintParams = z.infer<typeof updateDocumentBlueprintSchema>;

const UpdateDocumentBlueprintTool = {
  name: "update-document-blueprint",
  description: "Updates a document blueprint by Id",
  inputSchema: updateDocumentBlueprintSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update'],
  handler: (async (model: UpdateDocumentBlueprintParams) => {
    return executeVoidApiCall((client) =>
      client.putDocumentBlueprintById(model.id, model.data as UpdateDocumentBlueprintRequestModel, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateDocumentBlueprintSchema.shape>;

export default withStandardDecorators(UpdateDocumentBlueprintTool);
