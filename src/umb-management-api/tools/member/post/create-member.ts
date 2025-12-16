import { UmbracoManagementClient } from "@umb-management-client";
import { postMemberBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateMemberRequestModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateMemberTool = {
  name: "create-member",
  description: `Creates a member in Umbraco.
  Use this endpoint to create new members with the specified properties and groups.`,
  schema: postMemberBody.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateMemberRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMember(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postMemberBody.shape>;

export default withStandardDecorators(CreateMemberTool);
