import { postDocumentValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const ValidateDocumentTool = {
  name: "validate-document",
  description: "Validates a create document model, using the Umbraco API.",
  inputSchema: postDocumentValidateBody.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['validate'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Create),
  handler: (async (model: z.infer<typeof postDocumentValidateBody>) => {
    return executeVoidApiCall((client) =>
      client.postDocumentValidate(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postDocumentValidateBody.shape>;

export default withStandardDecorators(ValidateDocumentTool);
