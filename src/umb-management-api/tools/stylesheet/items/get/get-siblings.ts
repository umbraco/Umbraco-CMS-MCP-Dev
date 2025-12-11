import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeStylesheetSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStylesheetSiblingsTool = CreateUmbracoReadTool(
  "get-stylesheet-siblings",
  "Gets sibling stylesheets for a given descendant path",
  getTreeStylesheetSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeStylesheetSiblings(params);

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

export default GetStylesheetSiblingsTool;
