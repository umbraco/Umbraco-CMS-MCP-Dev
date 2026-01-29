import { CreateMediaRequestModel } from "@/umb-management-api/schemas/index.js";
import { postMediaValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const ValidateMediaTool = {
  name: "validate-media",
  description: "Validates a media item using the Umbraco API.",
  inputSchema: postMediaValidateBody.shape,
  annotations: { readOnlyHint: true },
  slices: ['validate'],
  handler: (async (model: CreateMediaRequestModel) => {
    return executeVoidApiCall((client) =>
      client.postMediaValidate(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postMediaValidateBody.shape>;

export default withStandardDecorators(ValidateMediaTool);
