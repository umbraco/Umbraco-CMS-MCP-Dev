import { deleteDocumentByIdPublicAccessParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const DeleteDocumentPublicAccessTool = {
  name: "delete-document-public-access",
  description: "Removes public access settings from a document by Id.",
  inputSchema: deleteDocumentByIdPublicAccessParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteDocumentByIdPublicAccess(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDocumentByIdPublicAccessParams.shape>;

export default withStandardDecorators(DeleteDocumentPublicAccessTool);
