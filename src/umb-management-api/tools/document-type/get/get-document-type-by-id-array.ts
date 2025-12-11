import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getItemDocumentTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypesByIdArrayTool = CreateUmbracoReadTool(
  "get-document-types-by-id-array",
  "Gets document types by IDs (or empty array if no IDs are provided)",
  getItemDocumentTypeQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocumentType(params);

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

export default GetDocumentTypesByIdArrayTool;
