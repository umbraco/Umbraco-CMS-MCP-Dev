import { CreateMediaRequestModel } from "@/umb-management-api/schemas/index.js";
import { postMediaValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
