import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postMediaBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateMediaTool = CreateUmbracoTool(
  "create-media",
  `Creates a media item.
  Use this endpoint to create media items like images, files, or folders.
  The process is as follows:
  - Create a temporary file using the temporary file endpoint
  - Use the temporary file id when creating a media item using this endpoint

  IMPORTANT: When creating media with values (like images), you must include the editorAlias field
  in each value object. For images, use "Umbraco.ImageCropper" as the editorAlias.

  Example value for an image:
  {
    "alias": "umbracoFile",
    "editorAlias": "Umbraco.ImageCropper",
    "entityType": "media-property-value",
    "value": {
      "temporaryFileId": "<temp-file-id>",
      "crops": [],
      "focalPoint": { "left": 0.5, "right": 0.5 }
    }
  }`,
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
