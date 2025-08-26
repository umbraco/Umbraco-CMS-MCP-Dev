import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { getTreeTemplateAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetTemplateAncestorsTool = CreateUmbracoTool(
  "get-template-ancestors",
  "Gets the ancestors of a template by Id",
  getTreeTemplateAncestorsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeTemplateAncestors(params);

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

export default GetTemplateAncestorsTool;
