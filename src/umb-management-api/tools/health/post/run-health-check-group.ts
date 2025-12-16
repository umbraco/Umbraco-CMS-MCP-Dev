import { UmbracoManagementClient } from "@umb-management-client";
import { postHealthCheckGroupByNameCheckParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const RunHealthCheckGroupTool = {
  name: "run-health-check-group",
  description: "Executes health checks for a specific group. WARNING: This will run system diagnostics which may take time and could temporarily affect system performance.",
  schema: postHealthCheckGroupByNameCheckParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (params: { name: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postHealthCheckGroupByNameCheck(params.name);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof postHealthCheckGroupByNameCheckParams.shape>;

export default withStandardDecorators(RunHealthCheckGroupTool);