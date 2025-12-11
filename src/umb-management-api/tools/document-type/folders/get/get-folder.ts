import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeFolderTool = CreateUmbracoReadTool(
  "get-document-type-folder",
  "Gets a document type folder by Id",
  getDocumentTypeFolderByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeFolderById(id);

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

export default GetDocumentTypeFolderTool;
