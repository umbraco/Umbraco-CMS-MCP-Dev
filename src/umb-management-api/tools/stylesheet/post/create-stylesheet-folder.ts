import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateStylesheetFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postStylesheetFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const CreateStylesheetFolderTool = CreateUmbracoWriteTool(
  "create-stylesheet-folder",
  "Creates a new stylesheet folder",
  postStylesheetFolderBody.shape,
  async (model: CreateStylesheetFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postStylesheetFolder(model);

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

export default CreateStylesheetFolderTool;