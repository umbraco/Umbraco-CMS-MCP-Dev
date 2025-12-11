import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeDataTypeChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDataTypeChildrenTool = CreateUmbracoReadTool(
  "get-data-type-children",
  "Gets the children data types or data type folders by the parent id",
  getTreeDataTypeChildrenQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDataTypeChildren(params);

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

export default GetDataTypeChildrenTool;
