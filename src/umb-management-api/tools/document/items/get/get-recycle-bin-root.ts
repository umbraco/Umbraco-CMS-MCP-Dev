import { UmbracoManagementClient } from "@umb-management-client";
import { getRecycleBinDocumentRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetRecycleBinDocumentRootTool = {
  name: "get-recycle-bin-document-root",
  description: "Gets root items for the document recycle bin.",
  schema: getRecycleBinDocumentRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree', 'recycle-bin'],
  handler: async (params: z.infer<typeof getRecycleBinDocumentRootQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinDocumentRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRecycleBinDocumentRootQueryParams.shape>;

export default withStandardDecorators(GetRecycleBinDocumentRootTool);
