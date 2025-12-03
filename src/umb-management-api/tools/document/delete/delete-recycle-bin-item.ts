import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteRecycleBinDocumentByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteDocumentRecycleBinItemTool = CreateUmbracoTool(
  "delete-document-recycle-bin-item",
  "Permanently deletes a document from the recycle bin by its id",
  deleteRecycleBinDocumentByIdParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    await client.deleteRecycleBinDocumentById(params.id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ success: true, message: "Document permanently deleted from recycle bin" }),
        },
      ],
    };
  }
);

export default DeleteDocumentRecycleBinItemTool;
