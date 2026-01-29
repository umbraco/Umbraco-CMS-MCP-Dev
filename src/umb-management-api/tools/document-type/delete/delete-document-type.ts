import { deleteDocumentTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteDocumentTypeTool = {
  name: "delete-document-type",
  description: "Deletes a document type by Id",
  inputSchema: deleteDocumentTypeByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteDocumentTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDocumentTypeByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentTypeTool);
