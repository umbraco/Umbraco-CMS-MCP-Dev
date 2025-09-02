import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { CreatePartialViewFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postPartialViewFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreatePartialViewFolderTool = CreateUmbracoTool(
  "create-partial-view-folder",
  "Creates a new partial view folder",
  postPartialViewFolderBody.shape,
  async (model: CreatePartialViewFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postPartialViewFolder(model);

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

export default CreatePartialViewFolderTool;