import { UpdateFolderResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  putDocumentBlueprintFolderByIdParams,
  putDocumentBlueprintFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const updateDocumentBlueprintFolderSchema = z.object({
  id: putDocumentBlueprintFolderByIdParams.shape.id,
  data: z.object(putDocumentBlueprintFolderByIdBody.shape),
});

type UpdateDocumentBlueprintFolderParams = z.infer<typeof updateDocumentBlueprintFolderSchema>;

const UpdateDocumentBlueprintFolderTool = {
  name: "update-document-blueprint-folder",
  description: "Updates a document blueprint folder",
  inputSchema: updateDocumentBlueprintFolderSchema.shape,
  annotations: { idempotentHint: true },
  slices: ['update', 'folders'],
  handler: (async ({ id, data }: UpdateDocumentBlueprintFolderParams) => {
    return executeVoidApiCall((client) =>
      client.putDocumentBlueprintFolderById(id, data as UpdateFolderResponseModel, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateDocumentBlueprintFolderSchema.shape>;

export default withStandardDecorators(UpdateDocumentBlueprintFolderTool);
