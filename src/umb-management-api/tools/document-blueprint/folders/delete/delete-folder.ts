import { deleteDocumentBlueprintFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
