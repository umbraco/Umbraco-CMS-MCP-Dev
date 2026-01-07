import { deleteDocumentTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const DeleteDocumentTypeFolderTool = {
  name: "delete-document-type-folder",
  description: "Deletes a document type folder by Id",
  inputSchema: deleteDocumentTypeFolderByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteDocumentTypeFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDocumentTypeFolderByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentTypeFolderTool);
