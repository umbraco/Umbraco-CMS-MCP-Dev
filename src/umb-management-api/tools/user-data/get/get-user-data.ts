import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserDataQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserDataTool = CreateUmbracoReadTool(
  "get-user-data",
  "Retrieves user data records with pagination and filtering",
  getUserDataQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserData(params);

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

export default GetUserDataTool;