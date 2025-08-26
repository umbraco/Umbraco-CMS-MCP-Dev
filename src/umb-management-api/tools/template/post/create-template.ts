import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { CreateTemplateRequestModel } from "@/umb-management-api/schemas/index.js";
import { postTemplateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateTemplateTool = CreateUmbracoTool(
  "create-template",
  "Creates a new template",
  postTemplateBody.shape,
  async (model: CreateTemplateRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postTemplate(model);

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

export default CreateTemplateTool;
