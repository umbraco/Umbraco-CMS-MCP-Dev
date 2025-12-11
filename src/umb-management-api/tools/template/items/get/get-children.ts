import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeTemplateChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetTemplateChildrenTool = CreateUmbracoReadTool(
  "get-template-children",
  "Gets the children templates or template folders by the parent id",
  getTreeTemplateChildrenQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeTemplateChildren(params);

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

export default GetTemplateChildrenTool;
