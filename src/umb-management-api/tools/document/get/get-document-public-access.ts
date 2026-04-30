import { getDocumentByIdPublicAccessParams, getDocumentByIdPublicAccessQueryParams, getDocumentByIdPublicAccessResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = z.object({
  ...getDocumentByIdPublicAccessParams.shape,
  ...getDocumentByIdPublicAccessQueryParams.shape,
});

const GetDocumentPublicAccessTool = {
  name: "get-document-public-access",
  description: `Gets the public access settings for a document by Id.
  Set includeAncestors=true to also resolve protection inherited from an ancestor
  (the response's isProtectedByAncestor field reflects this).`,
  inputSchema: inputSchema.shape,
  outputSchema: getDocumentByIdPublicAccessResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: (async ({ id, includeAncestors }: { id: string; includeAncestors?: boolean }) => {
    return executeGetApiCall((client) =>
      client.getDocumentByIdPublicAccess(id, { includeAncestors }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getDocumentByIdPublicAccessResponse.shape>;

export default withStandardDecorators(GetDocumentPublicAccessTool);
