import { UmbracoManagementClient } from "@umb-management-client";
import { deleteDocumentByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteFromRecycleBinTool = {
  name: "delete-from-recycle-bin",
  description: "Deletes a document from the recycle bin by Id.",
  schema: deleteDocumentByIdParams.shape,
  isReadOnly: false,
  slices: ['delete', 'recycle-bin'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteDocumentById(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteDocumentByIdParams.shape>;

export default withStandardDecorators(DeleteFromRecycleBinTool);
