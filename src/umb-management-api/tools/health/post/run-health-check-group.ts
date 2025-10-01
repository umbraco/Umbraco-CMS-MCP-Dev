import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postHealthCheckGroupByNameCheckParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const RunHealthCheckGroupTool = CreateUmbracoTool(
  "run-health-check-group",
  "Executes health checks for a specific group. WARNING: This will run system diagnostics which may take time and could temporarily affect system performance.",
  postHealthCheckGroupByNameCheckParams.shape,
  async (params: { name: string }) => {
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
);

export default RunHealthCheckGroupTool;