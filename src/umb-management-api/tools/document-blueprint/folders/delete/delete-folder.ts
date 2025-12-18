import { UmbracoManagementClient } from "@umb-management-client";
import { deleteDocumentBlueprintFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteDocumentBlueprintFolderTool = {
  name: "delete-document-blueprint-folder",
  description: "Deletes a document blueprint folder by Id",
  schema: deleteDocumentBlueprintFolderByIdParams.shape,
  isReadOnly: false,
  slices: ['delete', 'folders'],
  handler: async ({ id }: { id: string }) => {
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
  },
} satisfies ToolDefinition<typeof deleteDocumentBlueprintFolderByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentBlueprintFolderTool);
