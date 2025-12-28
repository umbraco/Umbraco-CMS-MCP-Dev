import { UmbracoManagementClient } from "@umb-management-client";
import { CreateMemberTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import { postMemberTypeBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateMemberTypeTool = {
  name: "create-member-type",
  description: "Creates a new member type",
  schema: postMemberTypeBody.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateMemberTypeRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMemberType(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postMemberTypeBody.shape>;

export default withStandardDecorators(CreateMemberTypeTool);
