import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteDocumentBlueprintByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteDocumentBlueprintTool = CreateUmbracoWriteTool(
  "delete-document-blueprint",
  "Deletes a document blueprint by Id",
  deleteDocumentBlueprintByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteDocumentBlueprintById(id);
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

export default DeleteDocumentBlueprintTool;
