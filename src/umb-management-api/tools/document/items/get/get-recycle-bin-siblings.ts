import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinDocumentSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentRecycleBinSiblingsTool = {
  name: "get-document-recycle-bin-siblings",
  description: "Gets sibling documents in the recycle bin for a given descendant id",
  schema: getRecycleBinDocumentSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree', 'recycle-bin'],
  handler: async (params: z.infer<typeof getRecycleBinDocumentSiblingsQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinDocumentSiblings(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinDocumentSiblingsQueryParams.shape>;

export default withStandardDecorators(GetDocumentRecycleBinSiblingsTool);
