import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDataTypeFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateDataTypeFolderTool = CreateUmbracoWriteTool(
  "create-data-type-folder",
  "Creates a new data type folder",
  postDataTypeFolderBody.shape,
  async (model: CreateFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postDataTypeFolder(model);

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

export default CreateDataTypeFolderTool;
