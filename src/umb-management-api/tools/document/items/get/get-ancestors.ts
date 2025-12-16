import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeDocumentAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentAncestorsTool = {
  name: "get-document-ancestors",
  description: "Gets ancestor items for a document.",
  schema: getTreeDocumentAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: z.infer<typeof getTreeDocumentAncestorsQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentAncestors(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDocumentAncestorsQueryParams.shape>;

export default withStandardDecorators(GetDocumentAncestorsTool);
