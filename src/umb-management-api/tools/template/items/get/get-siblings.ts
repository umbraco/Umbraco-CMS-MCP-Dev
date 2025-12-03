import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeTemplateSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetTemplateSiblingsTool = CreateUmbracoTool(
  "get-template-siblings",
  "Gets sibling templates for a given descendant id",
  getTreeTemplateSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeTemplateSiblings(params);

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

export default GetTemplateSiblingsTool;
