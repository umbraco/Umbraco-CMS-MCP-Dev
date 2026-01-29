import {
  postDocumentByIdPublicAccessParams,
  postDocumentByIdPublicAccessBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: postDocumentByIdPublicAccessParams.shape.id,
  data: z.object(postDocumentByIdPublicAccessBody.shape),
};

const PostDocumentPublicAccessTool = {
  name: "post-document-public-access",
  description: "Adds public access settings to a document by Id.",
  inputSchema: inputSchema,
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.postDocumentByIdPublicAccess(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(PostDocumentPublicAccessTool);
