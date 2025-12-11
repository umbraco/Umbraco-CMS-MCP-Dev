import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getHealthCheckGroupQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetHealthCheckGroupsTool = CreateUmbracoReadTool(
  "get-health-check-groups",
  "Gets a paged list of health check groups for system monitoring",
  getHealthCheckGroupQueryParams.shape,
  async (params: { skip?: number; take?: number }) => {
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
);

export default GetHealthCheckGroupsTool;