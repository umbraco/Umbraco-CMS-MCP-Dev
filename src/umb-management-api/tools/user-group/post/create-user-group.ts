import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUserGroupRequestModel } from "@/umb-management-api/schemas/index.js";
import { postUserGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateUserGroupTool = {
  name: "create-user-group",
  description: "Creates a new user group",
  schema: postUserGroupBody.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateUserGroupRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postUserGroup(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postUserGroupBody.shape>;

export default withStandardDecorators(CreateUserGroupTool);
