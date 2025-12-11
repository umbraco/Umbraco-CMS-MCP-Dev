import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentBlueprintFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentBlueprintFolderTool = CreateUmbracoReadTool(
  "get-document-blueprint-folder",
  "Gets a document blueprint folder by Id",
  getDocumentBlueprintFolderByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getDocumentBlueprintFolderById(id);
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

export default GetDocumentBlueprintFolderTool;
