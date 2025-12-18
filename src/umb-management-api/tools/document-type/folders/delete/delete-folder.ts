import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { deleteDocumentTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteDocumentTypeFolderTool = {
  name: "delete-document-type-folder",
  description: "Deletes a document type folder by Id",
  schema: deleteDocumentTypeFolderByIdParams.shape,
  isReadOnly: false,
  slices: ['delete', 'folders'],
  handler: async ({ id }: { id: string }) => {
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
} satisfies ToolDefinition<typeof deleteDocumentTypeFolderByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentTypeFolderTool);
