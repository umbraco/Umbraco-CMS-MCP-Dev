import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const emptySchema = {};

const GetMemberConfigurationTool = {
  name: "get-member-configuration",
  description: "Gets member configuration including reserved field names",
  schema: emptySchema,
  isReadOnly: true,
  slices: ['read'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMemberConfiguration();
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof emptySchema>;

export default withStandardDecorators(GetMemberConfigurationTool);
