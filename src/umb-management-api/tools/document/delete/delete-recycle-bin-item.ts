import { deleteRecycleBinDocumentByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const DeleteDocumentRecycleBinItemTool = {
  name: "delete-document-recycle-bin-item",
  description: "Permanently deletes a document from the recycle bin by its id",
  inputSchema: deleteRecycleBinDocumentByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteRecycleBinDocumentById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteRecycleBinDocumentByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentRecycleBinItemTool);
