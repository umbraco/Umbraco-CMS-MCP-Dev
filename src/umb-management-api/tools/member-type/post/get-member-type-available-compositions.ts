import { UmbracoManagementClient } from "@umb-management-client";
import { postMemberTypeAvailableCompositionsBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTypeAvailableCompositionsTool = {
  name: "get-member-type-available-compositions",
  description: "Gets the available compositions for a member type",
  schema: postMemberTypeAvailableCompositionsBody.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (model: any) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMemberTypeAvailableCompositions(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postMemberTypeAvailableCompositionsBody.shape>;

export default withStandardDecorators(GetMemberTypeAvailableCompositionsTool);
