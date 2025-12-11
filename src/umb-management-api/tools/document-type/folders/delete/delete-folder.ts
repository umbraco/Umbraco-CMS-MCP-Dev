import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteDocumentTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteDocumentTypeFolderTool = CreateUmbracoWriteTool(
  "delete-document-type-folder",
  "Deletes a document type folder by Id",
  deleteDocumentTypeFolderByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteDocumentTypeFolderById(id);

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

export default DeleteDocumentTypeFolderTool;
