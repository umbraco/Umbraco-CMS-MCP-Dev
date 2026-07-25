import {
  putDocumentByIdParams,
  putDocumentByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: putDocumentByIdParams.shape.id,
  data: z.object(putDocumentByIdBody.shape),
};

const UpdateDocumentTool = {
  name: "update-document",
  description: `Updates a document by Id. USE AS LAST RESORT ONLY.

  IMPORTANT: Prefer these specialized tools instead:
  - update-document-name: For renaming a document (or a specific culture variant) - the safe way to change the name
  - update-document-properties: For updating individual property values (simpler, safer)
  - update-block-property: For updating properties within BlockList/BlockGrid/RichText blocks

  Only use this tool when you need to update document-level metadata (template, variants)
  or when the specialized tools cannot handle your specific use case.

  If you must use this tool:
  - Always read the current document value first
  - Only update the required values
  - Don't miss any properties from the original document
  - WARNING: passing an empty "values" array will DELETE all existing property values on the document.
    Always include the full, unmodified "values" array from the document you just read unless you
    intend to clear every property.`,
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateDocumentTool);
