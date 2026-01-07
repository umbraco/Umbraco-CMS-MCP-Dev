import { deleteDocumentBlueprintByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
