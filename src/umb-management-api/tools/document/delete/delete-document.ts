import { deleteDocumentByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const DeleteDocumentTool = {
  name: "delete-document",
  description: "Deletes a document by Id",
  inputSchema: deleteDocumentByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteDocumentById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDocumentByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentTool);
