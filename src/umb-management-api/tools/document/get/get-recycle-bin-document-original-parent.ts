import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinDocumentByIdOriginalParentParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetRecycleBinDocumentOriginalParentTool = {
  name: "get-recycle-bin-document-original-parent",
  description: `Get the original parent location of a document item in the recycle bin
  Returns information about where the document item was located before deletion.`,
  schema: getRecycleBinDocumentByIdOriginalParentParams.shape,
  isReadOnly: true,
  slices: ['read', 'recycle-bin'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinDocumentByIdOriginalParent(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinDocumentByIdOriginalParentParams.shape>;

export default withStandardDecorators(GetRecycleBinDocumentOriginalParentTool);