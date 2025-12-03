import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteUserDataByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteUserDataTool = CreateUmbracoTool(
  "delete-user-data",
  "Deletes user data by its id",
  deleteUserDataByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteUserDataById(id);

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

export default DeleteUserDataTool;
