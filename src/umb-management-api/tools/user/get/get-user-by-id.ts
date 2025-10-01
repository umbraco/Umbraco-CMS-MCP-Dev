import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserByIdTool = CreateUmbracoTool(
  "get-user-by-id",
  "Gets a user by their unique identifier",
  getUserByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserById(id);

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

export default GetUserByIdTool;