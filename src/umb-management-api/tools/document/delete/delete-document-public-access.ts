import { UmbracoManagementClient } from "@umb-management-client";
import { deleteDocumentByIdPublicAccessParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteDocumentPublicAccessTool = {
  name: "delete-document-public-access",
  description: "Removes public access settings from a document by Id.",
  schema: deleteDocumentByIdPublicAccessParams.shape,
  isReadOnly: false,
  slices: ['public-access'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteDocumentByIdPublicAccess(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteDocumentByIdPublicAccessParams.shape>;

export default withStandardDecorators(DeleteDocumentPublicAccessTool);
