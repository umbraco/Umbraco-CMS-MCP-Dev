import { postMemberValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateMemberRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const ValidateMemberTool = {
  name: "validate-member",
  description: `Validates member data before creation using the Umbraco API.
  Use this endpoint to validate member data structure, properties, and business rules before attempting to create a new member.`,
  inputSchema: postMemberValidateBody.shape,
  annotations: { readOnlyHint: true },
  slices: ['validate'],
  handler: (async (model: CreateMemberRequestModel) => {
    return executeVoidApiCall((client) =>
      client.postMemberValidate(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postMemberValidateBody.shape>;

export default withStandardDecorators(ValidateMemberTool);
