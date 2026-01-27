import { getDocumentByIdPublicAccessParams, getDocumentByIdPublicAccessResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
