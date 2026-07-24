import { deleteDocumentByIdPublicAccessParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
