import {
  putDocumentByIdParams,
  putDocumentByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = {
  id: putDocumentByIdParams.shape.id,
  data: z.object(putDocumentByIdBody.shape),
};

const UpdateDocumentTool = {
  name: "update-document",
  description: `Updates a document by Id. USE AS LAST RESORT ONLY.

  IMPORTANT: Prefer these specialized tools instead:
  - update-document-properties: For updating individual property values (simpler, safer)
  - update-block-property: For updating properties within BlockList/BlockGrid/RichText blocks

  Only use this tool when you need to update document-level metadata (template, variants)
  or when the specialized tools cannot handle your specific use case.

  If you must use this tool:
  - Always read the current document value first
  - Only update the required values
  - Don't miss any properties from the original document`,
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
