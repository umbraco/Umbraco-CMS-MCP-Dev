import { postDocumentVersionByIdRollbackParams, postDocumentVersionByIdRollbackQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Combined schema for both path params and query params
const createDocumentVersionRollbackSchema = postDocumentVersionByIdRollbackParams.merge(
  postDocumentVersionByIdRollbackQueryParams
);

const CreateDocumentVersionRollbackTool = {
  name: "create-document-version-rollback",
  description: "Rollback document to a specific version",
  inputSchema: createDocumentVersionRollbackSchema.shape,
  slices: ['create'],
  handler: (async ({ id, culture }: { id: string; culture?: string }) => {
    return executeVoidApiCall((client) =>
      client.postDocumentVersionByIdRollback(id, { culture }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof createDocumentVersionRollbackSchema.shape>;

export default withStandardDecorators(CreateDocumentVersionRollbackTool);
