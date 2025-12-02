import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreePartialViewSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetPartialViewSiblingsTool = CreateUmbracoTool(
  "get-partial-view-siblings",
  "Gets sibling partial views for a given descendant path",
  getTreePartialViewSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreePartialViewSiblings(params);

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

export default GetPartialViewSiblingsTool;
