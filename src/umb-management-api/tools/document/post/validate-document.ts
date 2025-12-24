import { postDocumentValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

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
