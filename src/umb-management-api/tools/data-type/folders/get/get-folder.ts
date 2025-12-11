import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDataTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDataTypeFolderTool = CreateUmbracoReadTool(
  "get-data-type-folder",
  "Gets a data type folder by Id",
  getDataTypeFolderByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getDataTypeFolderById(id);

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

export default GetDataTypeFolderTool;
