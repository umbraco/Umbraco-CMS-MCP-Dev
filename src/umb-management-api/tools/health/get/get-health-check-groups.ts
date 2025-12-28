import { UmbracoManagementClient } from "@umb-management-client";
import { getHealthCheckGroupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetHealthCheckGroupsTool = {
  name: "get-health-check-groups",
  description: "Gets a paged list of health check groups for system monitoring",
  schema: getHealthCheckGroupQueryParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (params: { skip?: number; take?: number }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getHealthCheckGroup(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getHealthCheckGroupQueryParams.shape>;

export default withStandardDecorators(GetHealthCheckGroupsTool);