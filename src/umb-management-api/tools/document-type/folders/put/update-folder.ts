import {
  putDocumentTypeFolderByIdParams,
  putDocumentTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const updateDocumentTypeFolderSchema = {
  id: putDocumentTypeFolderByIdParams.shape.id,
  data: z.object(putDocumentTypeFolderByIdBody.shape),
};

const UpdateDocumentTypeFolderTool = {
  name: "update-document-type-folder",
  description: "Updates a document type folder by Id",
  inputSchema: updateDocumentTypeFolderSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update', 'folders'],
  handler: (async (model: { id: string; data: { name: string } }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentTypeFolderById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateDocumentTypeFolderSchema>;

export default withStandardDecorators(UpdateDocumentTypeFolderTool);
