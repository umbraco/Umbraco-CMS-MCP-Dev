import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getFilterUserQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const FindUserTool = CreateUmbracoReadTool(
  "find-user",
  "Finds users by filtering with name, email, or other criteria",
  getFilterUserQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getFilterUser(params);

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

export default FindUserTool;