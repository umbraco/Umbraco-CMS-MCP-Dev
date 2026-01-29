import { postDocumentTypeBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateDocumentTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const ValidateDocumentTypePostTool = {
  name: "validate-document-type-post",
  description: "Validates a document type using the Umbraco API (POST, does not persist changes).",
  inputSchema: postDocumentTypeBody.shape,
  annotations: { readOnlyHint: true },
  slices: ['validate'],
  handler: (async (model: CreateDocumentTypeRequestModel) => {
    return executeVoidApiCall((client) =>
      client.postDocumentType(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postDocumentTypeBody.shape>;

export default withStandardDecorators(ValidateDocumentTypePostTool);
