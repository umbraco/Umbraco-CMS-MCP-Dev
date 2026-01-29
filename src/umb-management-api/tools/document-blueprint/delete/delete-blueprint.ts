import { deleteDocumentBlueprintByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteDocumentBlueprintTool = {
  name: "delete-document-blueprint",
  description: "Deletes a document blueprint by Id",
  inputSchema: deleteDocumentBlueprintByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteDocumentBlueprintById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDocumentBlueprintByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentBlueprintTool);
