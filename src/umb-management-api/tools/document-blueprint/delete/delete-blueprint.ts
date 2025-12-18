import { UmbracoManagementClient } from "@umb-management-client";
import { deleteDocumentBlueprintByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteDocumentBlueprintTool = {
  name: "delete-document-blueprint",
  description: "Deletes a document blueprint by Id",
  schema: deleteDocumentBlueprintByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
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
  },
} satisfies ToolDefinition<typeof deleteDocumentBlueprintByIdParams.shape>;

export default withStandardDecorators(DeleteDocumentBlueprintTool);
