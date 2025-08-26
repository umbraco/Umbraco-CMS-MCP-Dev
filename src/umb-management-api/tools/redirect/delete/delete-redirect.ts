import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { deleteRedirectManagementByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteRedirectTool = CreateUmbracoTool(
  "delete-redirect",
  `Deletes a specific redirect by its ID.
  Parameters:
  - id: The unique identifier of the redirect to delete (string)
  
  Returns no content on success.`,
  deleteRedirectManagementByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    await client.deleteRedirectManagementById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: "Redirect deleted successfully",
        },
      ],
    };
  }
);

export default DeleteRedirectTool;
