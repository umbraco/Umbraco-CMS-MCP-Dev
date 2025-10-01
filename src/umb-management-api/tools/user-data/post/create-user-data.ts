import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postUserDataBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateUserDataTool = CreateUmbracoTool(
  "create-user-data",
  "Creates a new user data record",
  postUserDataBody.shape,
  async (body) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postUserData(body);

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

export default CreateUserDataTool;