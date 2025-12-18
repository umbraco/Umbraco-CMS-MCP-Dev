import { UmbracoManagementClient } from "@umb-management-client";
import { getHealthCheckGroupByNameParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetHealthCheckGroupByNameTool = {
  name: "get-health-check-group-by-name",
  description: "Gets specific health check group details by name for system monitoring",
  schema: getHealthCheckGroupByNameParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (params: { name: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getHealthCheckGroupByName(params.name);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getHealthCheckGroupByNameParams.shape>;

export default withStandardDecorators(GetHealthCheckGroupByNameTool);