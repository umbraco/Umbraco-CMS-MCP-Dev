import { getDocumentByIdPublicAccessParams, getDocumentByIdPublicAccessResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const GetDocumentPublicAccessTool = {
  name: "get-document-public-access",
  description: "Gets the public access settings for a document by Id.",
  inputSchema: getDocumentByIdPublicAccessParams.shape,
  outputSchema: getDocumentByIdPublicAccessResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentByIdPublicAccess(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentByIdPublicAccessParams.shape, typeof getDocumentByIdPublicAccessResponse.shape>;

export default withStandardDecorators(GetDocumentPublicAccessTool);
