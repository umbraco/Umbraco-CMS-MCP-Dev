import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postMediaValidateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const ValidateMediaTool = CreateUmbracoReadTool(
  "validate-media",
  "Validates a media item using the Umbraco API.",
  postMediaValidateBody.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMediaValidate(model);
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

export default ValidateMediaTool;
