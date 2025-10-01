import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { putUserDataBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const UpdateUserDataTool = CreateUmbracoTool(
  "update-user-data",
  "Updates an existing user data record",
  putUserDataBody.shape,
  async (body) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putUserData(body);

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

export default UpdateUserDataTool;