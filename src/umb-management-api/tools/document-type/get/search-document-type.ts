import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { getItemDocumentTypeSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemDocumentTypeSearchParams } from "@/umb-management-api/schemas/index.js";

const SearchDocumentTypeTool = {
  name: "search-document-type",
  description: "Search for document types by name",
  schema: getItemDocumentTypeSearchQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (model: GetItemDocumentTypeSearchParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocumentTypeSearch(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getItemDocumentTypeSearchQueryParams.shape>;

export default withStandardDecorators(SearchDocumentTypeTool);
