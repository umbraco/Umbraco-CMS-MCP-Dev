import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CopyMemberTypeTool = {
  name: "copy-member-type",
  description: "Copy a member type to a new location",
  schema: {
    id: z.string().uuid(),
  },
  isReadOnly: false,
  slices: ['copy'],
  handler: async (model: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMemberTypeByIdCopy(model.id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<{
  id: ReturnType<typeof z.string>;
}>;

export default withStandardDecorators(CopyMemberTypeTool);
