import { UpdateDocumentTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putDocumentTypeByIdParams,
  putDocumentTypeByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const updateDocumentTypeSchema = {
  id: putDocumentTypeByIdParams.shape.id,
  data: z.object(putDocumentTypeByIdBody.shape),
};

const UpdateDocumentTypeTool = {
  name: "update-document-type",
  description: "Updates a document type by Id",
  inputSchema: updateDocumentTypeSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async (model: { id: string; data: UpdateDocumentTypeRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentTypeById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateDocumentTypeSchema>;

export default withStandardDecorators(UpdateDocumentTypeTool);
