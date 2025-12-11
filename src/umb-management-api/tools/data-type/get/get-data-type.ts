import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDataTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDataTypeTool = CreateUmbracoReadTool(
  "get-data-type",
  "Gets a data type by Id",
  getDataTypeByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDataTypeById(id);

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

export default GetDataTypeTool;
