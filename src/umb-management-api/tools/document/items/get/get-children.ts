import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeDocumentChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentChildrenTool = {
  name: "get-document-children",
  description: "Gets child items for a document.",
  schema: getTreeDocumentChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: z.infer<typeof getTreeDocumentChildrenQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentChildren(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDocumentChildrenQueryParams.shape>;

export default withStandardDecorators(GetDocumentChildrenTool);
