import {
  putDocumentByIdParams,
  putDocumentByIdBody,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { UmbracoManagementClient } from "@umb-management-client";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolValidationError,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: putDocumentByIdParams.shape.id,
  data: z.object(putDocumentByIdBody.shape),
  confirmClearValues: z
    .boolean()
    .optional()
    .describe(
      "Must be set to true to proceed when 'data.values' is an empty array and the document currently has property values. Without this, the call is rejected to prevent accidentally wiping every property value - the exact mistake that motivated this guard. Not needed if the document has no existing values, or if 'data.values' is non-empty."
    ),
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
    intend to clear every property. If the document currently has values, an empty "values" array is
    rejected unless "confirmClearValues" is set to true.`,
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: (async (model: { id: string; data: any; confirmClearValues?: boolean }) => {
    const incomingValues = model.data?.values;
    if (Array.isArray(incomingValues) && incomingValues.length === 0 && !model.confirmClearValues) {
      const client = UmbracoManagementClient.getClient();
      let currentDocument;
      try {
        currentDocument = await client.getDocumentById(model.id);
      } catch (error) {
        // Only swallow "not found" - the update call below will surface it with the
        // correct error shape. Any other failure (network, auth, server error) should
        // not silently disable this safety guard. Raw client calls throw a plain Error
        // with a `.response.status` attached (see the SDK's fetch mutator) rather than
        // the ToolValidationError-style UmbracoApiError, which is only constructed later
        // by the withErrorHandling decorator.
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status !== 404) {
          throw error;
        }
      }
      if (currentDocument && currentDocument.values.length > 0) {
        throw new ToolValidationError({
          title: "This update would clear all property values",
          detail: `The document currently has ${currentDocument.values.length} property value(s), but 'data.values' is empty. Sending an empty array wipes every property value on the document. If you only meant to rename the document, use update-document-name instead. If you meant to update specific properties, use update-document-properties. If you genuinely intend to clear all property values, set 'confirmClearValues: true' and resend, or include the full existing 'values' array unmodified.`,
        });
      }
    }
    return executeVoidApiCall((client) =>
      client.putDocumentById(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(UpdateDocumentTool);
