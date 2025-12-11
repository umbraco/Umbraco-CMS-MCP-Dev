import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteDocumentBlueprintFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteDocumentBlueprintFolderTool = CreateUmbracoWriteTool(
  "delete-document-blueprint-folder",
  "Deletes a document blueprint folder by Id",
  deleteDocumentBlueprintFolderByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteDocumentBlueprintFolderById(id);
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

export default DeleteDocumentBlueprintFolderTool;
