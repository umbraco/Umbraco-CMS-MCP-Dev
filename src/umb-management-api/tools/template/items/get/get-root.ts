import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { getTreeTemplateRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetTemplateRootTool = CreateUmbracoTool(
  "get-template-root",
  "Gets root items for templates.",
  getTreeTemplateRootQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeTemplateRoot(params);
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

export default GetTemplateRootTool;