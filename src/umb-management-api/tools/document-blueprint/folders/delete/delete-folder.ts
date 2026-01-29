import { deleteDocumentBlueprintFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteDocumentBlueprintFolderTool = {
  name: "delete-document-blueprint-folder",
  description: "Deletes a document blueprint folder by Id",
  inputSchema: deleteDocumentBlueprintFolderByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteDocumentBlueprintFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDocumentBlueprintFolderByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentBlueprintFolderTool);
