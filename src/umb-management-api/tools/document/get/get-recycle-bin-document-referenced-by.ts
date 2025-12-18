import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinDocumentReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetRecycleBinDocumentReferencedByTool = {
  name: "get-recycle-bin-document-referenced-by",
  description: `Get references to deleted document items in the recycle bin
  Use this to find content that still references deleted document items before permanently deleting them.`,
  schema: getRecycleBinDocumentReferencedByQueryParams.shape,
  isReadOnly: true,
  slices: ['references', 'recycle-bin'],
  handler: async ({ skip, take }: z.infer<typeof getRecycleBinDocumentReferencedByQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinDocumentReferencedBy({ skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinDocumentReferencedByQueryParams.shape>;

export default withStandardDecorators(GetRecycleBinDocumentReferencedByTool);