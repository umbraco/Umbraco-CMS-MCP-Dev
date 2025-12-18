import { UmbracoManagementClient } from "@umb-management-client";
import { CreateMemberGroupRequestModel } from "@/umb-management-api/schemas/index.js";
import { postMemberGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateMemberGroupTool = {
  name: "create-member-group",
  description: "Creates a new member group",
  schema: postMemberGroupBody.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateMemberGroupRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postMemberGroup(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postMemberGroupBody.shape>;

export default withStandardDecorators(CreateMemberGroupTool);
