import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserByIdCalculateStartNodesParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserByIdCalculateStartNodesTool = CreateUmbracoTool(
  "get-user-by-id-calculate-start-nodes",
  "Calculates start nodes for a user by their ID based on permissions",
  getUserByIdCalculateStartNodesParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserByIdCalculateStartNodes(id);

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

export default GetUserByIdCalculateStartNodesTool;