import { UmbracoManagementClient } from "@umb-management-client";
import { postMemberValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof postMemberValidateBody>;

const ValidateMemberTool = {
  name: "validate-member",
  description: `Validates member data before creation using the Umbraco API.
  Use this endpoint to validate member data structure, properties, and business rules before attempting to create a new member.`,
  schema: postMemberValidateBody.shape,
  isReadOnly: true,
  slices: ['validate'],
  handler: async (model: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMemberValidate(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postMemberValidateBody.shape>;

export default withStandardDecorators(ValidateMemberTool);