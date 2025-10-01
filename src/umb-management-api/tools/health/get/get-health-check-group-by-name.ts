import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getHealthCheckGroupByNameParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetHealthCheckGroupByNameTool = CreateUmbracoTool(
  "get-health-check-group-by-name",
  "Gets specific health check group details by name for system monitoring",
  getHealthCheckGroupByNameParams.shape,
  async (params: { name: string }) => {
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
);

export default GetHealthCheckGroupByNameTool;