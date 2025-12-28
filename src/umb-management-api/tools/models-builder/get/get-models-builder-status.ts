import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetModelsBuilderStatusTool = {
  name: "get-models-builder-status",
  description: `Gets the out-of-date status of Models Builder models.
  Returns an object containing:
  - status: The out-of-date status, one of: 'OutOfDate', 'Current', 'Unknown' (string)`,
  schema: {},
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getModelsBuilderStatus();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetModelsBuilderStatusTool);