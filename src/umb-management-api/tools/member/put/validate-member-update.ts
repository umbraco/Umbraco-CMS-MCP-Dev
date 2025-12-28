import { UmbracoManagementClient } from "@umb-management-client";
import {
  putMemberByIdValidateBody,
  putMemberByIdValidateParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const validateMemberUpdateSchema = {
  id: putMemberByIdValidateParams.shape.id,
  data: z.object(putMemberByIdValidateBody.shape),
};

const ValidateMemberUpdateTool = {
  name: "validate-member-update",
  description: `Validates member data before updating using the Umbraco API.
  Use this endpoint to validate member data structure, properties, and business rules before attempting to update an existing member.`,
  schema: validateMemberUpdateSchema,
  isReadOnly: true,
  slices: ['validate'],
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMemberByIdValidate(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof validateMemberUpdateSchema>;

export default withStandardDecorators(ValidateMemberUpdateTool);