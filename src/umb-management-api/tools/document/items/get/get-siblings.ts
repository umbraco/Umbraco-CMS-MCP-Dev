import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeDocumentSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentSiblingsTool = {
  name: "get-document-siblings",
  description: "Gets sibling documents for a given descendant id",
  schema: getTreeDocumentSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: z.infer<typeof getTreeDocumentSiblingsQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentSiblings(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDocumentSiblingsQueryParams.shape>;

export default withStandardDecorators(GetDocumentSiblingsTool);
