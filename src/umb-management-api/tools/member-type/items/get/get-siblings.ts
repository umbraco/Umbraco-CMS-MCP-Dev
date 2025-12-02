import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeMemberTypeSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetMemberTypeSiblingsTool = CreateUmbracoTool(
  "get-member-type-siblings",
  "Gets sibling member types or member type folders for a given descendant id",
  getTreeMemberTypeSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeMemberTypeSiblings(params);

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

export default GetMemberTypeSiblingsTool;
