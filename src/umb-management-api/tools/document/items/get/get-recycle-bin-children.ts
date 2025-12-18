import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinDocumentChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetRecycleBinDocumentChildrenTool = {
  name: "get-recycle-bin-document-children",
  description: "Gets child items for a document in the recycle bin.",
  schema: getRecycleBinDocumentChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree', 'recycle-bin'],
  handler: async (params: z.infer<typeof getRecycleBinDocumentChildrenQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinDocumentChildren(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinDocumentChildrenQueryParams.shape>;

export default withStandardDecorators(GetRecycleBinDocumentChildrenTool);
