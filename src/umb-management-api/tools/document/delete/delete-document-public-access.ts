import { deleteDocumentByIdPublicAccessParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import {
  emptyOutputShape,
  executeVoidApiCallWithEmptyOutput,
  type EmptyOutputShape,
} from "../../shared/execute-void-with-empty-output.js";

const DeleteDocumentPublicAccessTool = {
  name: "delete-document-public-access",
  description: "Removes public access settings from a document by Id.",
  inputSchema: deleteDocumentByIdPublicAccessParams.shape,
  outputSchema: emptyOutputShape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.deleteDocumentByIdPublicAccess(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteDocumentByIdPublicAccessParams.shape, EmptyOutputShape>;

export default withStandardDecorators(DeleteDocumentPublicAccessTool);
