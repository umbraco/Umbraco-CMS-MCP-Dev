import { UmbracoManagementClient } from "@umb-management-client";
import { deleteRecycleBinDocumentByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const DeleteDocumentRecycleBinItemTool = {
  name: "delete-document-recycle-bin-item",
  description: "Permanently deletes a document from the recycle bin by its id",
  schema: deleteRecycleBinDocumentByIdParams.shape,
  isReadOnly: false,
  slices: ['delete', 'recycle-bin'],
  handler: async (params: z.infer<typeof deleteRecycleBinDocumentByIdParams>) => {
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
  },
} satisfies ToolDefinition<typeof deleteRecycleBinDocumentByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentRecycleBinItemTool);
