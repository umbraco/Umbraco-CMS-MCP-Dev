import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getItemDocumentSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const SearchDocumentTool = CreateUmbracoReadTool(
  "search-document",
  "Searches for documents by query, skip, and take.",
  getItemDocumentSearchQueryParams.shape,
  async (params) => {
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
  }
);

export default SearchDocumentTool;
