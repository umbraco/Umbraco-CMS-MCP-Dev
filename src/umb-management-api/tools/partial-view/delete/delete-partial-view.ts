import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { deletePartialViewByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeletePartialViewTool = CreateUmbracoTool(
  "delete-partial-view",
  "Deletes a partial view by its path",
  deletePartialViewByPathParams.shape,
  async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deletePartialViewByPath(model.path);

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

export default DeletePartialViewTool;