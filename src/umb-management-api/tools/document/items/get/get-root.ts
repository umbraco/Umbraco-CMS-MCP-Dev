import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeDocumentRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentRootTool = {
  name: "get-document-root",
  description: "Gets root items for documents.",
  schema: getTreeDocumentRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: z.infer<typeof getTreeDocumentRootQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDocumentRootQueryParams.shape>;

export default withStandardDecorators(GetDocumentRootTool);
