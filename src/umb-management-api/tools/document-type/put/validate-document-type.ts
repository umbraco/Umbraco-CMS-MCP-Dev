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

const validateDocumentTypeSchema = {
  id: putDocumentTypeByIdParams.shape.id,
  data: z.object(putDocumentTypeByIdBody.shape),
};

const ValidateDocumentTypeTool = {
  name: "validate-document-type",
  description: "Validates a document type using the Umbraco API (PUT, does not persist changes).",
  inputSchema: validateDocumentTypeSchema,
  annotations: { readOnlyHint: true },
  slices: ['validate'],
  handler: (async (model: { id: string; data: UpdateDocumentTypeRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentTypeById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof validateDocumentTypeSchema>;

export default withStandardDecorators(ValidateDocumentTypeTool);
