import { UmbracoManagementClient } from "@umb-management-client";
import { getItemDocumentSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const SearchDocumentTool = {
  name: "search-document",
  description: "Searches for documents by query, skip, and take.",
  schema: getItemDocumentSearchQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (params: z.infer<typeof getItemDocumentSearchQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocumentSearch(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemDocumentSearchQueryParams.shape>;

export default withStandardDecorators(SearchDocumentTool);
