import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postMemberValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const ValidateMemberTool = CreateUmbracoTool(
  "validate-member",
  `Validates member data before creation using the Umbraco API.
  Use this endpoint to validate member data structure, properties, and business rules before attempting to create a new member.`,
  postMemberValidateBody.shape,
  async (model) => {
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
  }
);

export default ValidateMemberTool;