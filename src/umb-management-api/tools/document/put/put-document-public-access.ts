import {
  putDocumentByIdPublicAccessParams,
  putDocumentByIdPublicAccessBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = {
  id: putDocumentByIdPublicAccessParams.shape.id,
  data: z.object(putDocumentByIdPublicAccessBody.shape),
};

const PutDocumentPublicAccessTool = {
  name: "put-document-public-access",
  description: "Updates public access settings for a document by Id.",
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentByIdPublicAccess(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(PutDocumentPublicAccessTool);
