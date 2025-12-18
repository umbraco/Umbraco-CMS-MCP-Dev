import { UmbracoManagementClient } from "@umb-management-client";
import { getMemberTypeByIdCompositionReferencesParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMemberTypeCompositionReferencesTool = {
  name: "get-member-type-composition-references",
  description: "Gets the composition references for a member type",
  schema: getMemberTypeByIdCompositionReferencesParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberTypeByIdCompositionReferences(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMemberTypeByIdCompositionReferencesParams.shape>;

export default withStandardDecorators(GetMemberTypeCompositionReferencesTool);
