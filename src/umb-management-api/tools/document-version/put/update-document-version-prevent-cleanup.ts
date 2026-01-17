import { putDocumentVersionByIdPreventCleanupParams, putDocumentVersionByIdPreventCleanupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Combined schema for both path params and query params
const updateDocumentVersionPreventCleanupSchema = putDocumentVersionByIdPreventCleanupParams.merge(
  putDocumentVersionByIdPreventCleanupQueryParams
);

type SchemaParams = z.infer<typeof updateDocumentVersionPreventCleanupSchema>;

const UpdateDocumentVersionPreventCleanupTool = {
  name: "update-document-version-prevent-cleanup",
  description: "Prevent cleanup for a specific document version",
  inputSchema: updateDocumentVersionPreventCleanupSchema.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async ({ id, preventCleanup }: SchemaParams) => {
    return executeVoidApiCall((client) =>
      client.putDocumentVersionByIdPreventCleanup(id, { preventCleanup }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof updateDocumentVersionPreventCleanupSchema.shape>;

export default withStandardDecorators(UpdateDocumentVersionPreventCleanupTool);
