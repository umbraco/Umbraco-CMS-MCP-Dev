import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeDataTypeSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDataTypeSiblingsTool = CreateUmbracoReadTool(
  "get-data-type-siblings",
  "Gets sibling data types or data type folders for a given descendant id",
  getTreeDataTypeSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDataTypeSiblings(params);

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

export default GetDataTypeSiblingsTool;
