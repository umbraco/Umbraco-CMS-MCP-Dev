import { UmbracoManagementClient } from "@umb-management-client";
import { postUserDataBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUserDataRequestModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateUserDataTool = {
  name: "create-user-data",
  description: "Creates a new user data record",
  schema: postUserDataBody.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (body: CreateUserDataRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postUserData(body);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof postUserDataBody.shape>;

export default withStandardDecorators(CreateUserDataTool);