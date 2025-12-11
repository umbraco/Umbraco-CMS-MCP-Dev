import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserTool = CreateUmbracoReadTool(
  "get-user",
  "Lists users with pagination and filtering options",
  getUserQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUser(params);

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

export default GetUserTool;