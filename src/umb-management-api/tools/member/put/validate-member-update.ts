import { UpdateMemberRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMemberByIdValidateBody,
  putMemberByIdValidateParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = z.object({
  id: putMemberByIdValidateParams.shape.id,
  data: z.object(putMemberByIdValidateBody.shape),
});

const ValidateMemberUpdateTool = {
  name: "validate-member-update",
  description: `Validates member data before updating using the Umbraco API.
  Use this endpoint to validate member data structure, properties, and business rules before attempting to update an existing member.`,
  inputSchema: inputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['validate'],
  handler: (async (model: { id: string; data: UpdateMemberRequestModel }) => {
    return executeVoidApiCall((client) =>
      client.putMemberByIdValidate(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape>;

export default withStandardDecorators(ValidateMemberUpdateTool);
