import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getMediaTypeByIdCompositionReferencesParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMediaTypeCompositionReferencesTool = CreateUmbracoReadTool(
  "get-media-type-composition-references",
  "Gets the composition references for a media type",
  getMediaTypeByIdCompositionReferencesParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeByIdCompositionReferences(id);

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

export default GetMediaTypeCompositionReferencesTool;
