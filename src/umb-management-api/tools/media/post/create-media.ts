import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { postMediaBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateMediaTool = CreateUmbracoTool(
  "create-media",
  `Creates a media item.
  Use this endpoint to create media items like images, files, or folders.
  The process is as follows:
  - Create a temporary file using the temporary file endpoint
  - Use the temporary file id when creating a media item using this endpoint`,
  postMediaBody.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMedia(model);
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

export default CreateMediaTool;
