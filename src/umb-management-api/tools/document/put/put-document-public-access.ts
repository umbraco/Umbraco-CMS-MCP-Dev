import {
  putDocumentByIdPublicAccessParams,
  putDocumentByIdPublicAccessBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
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

const inputSchema = {
  id: putDocumentByIdPublicAccessParams.shape.id,
  data: z.object(putDocumentByIdPublicAccessBody.shape),
};

const PutDocumentPublicAccessTool = {
  name: "put-document-public-access",
  description: "Updates public access settings for a document by Id.",
  inputSchema: inputSchema,
  outputSchema: emptyOutputShape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['public-access'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.PublicAccess),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putDocumentByIdPublicAccess(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema, EmptyOutputShape>;

export default withStandardDecorators(PutDocumentPublicAccessTool);
