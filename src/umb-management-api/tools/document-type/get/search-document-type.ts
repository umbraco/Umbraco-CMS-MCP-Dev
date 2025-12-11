import { UmbracoManagementClient } from "@umb-management-client";
import { getItemDocumentTypeSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const SearchDocumentTypeTool = CreateUmbracoReadTool(
  "search-document-type",
  "Search for document types by name",
  getItemDocumentTypeSearchQueryParams.shape,
  async (model) => {
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
);

export default SearchDocumentTypeTool;
