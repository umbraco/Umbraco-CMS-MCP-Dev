import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentVersionByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentVersionByIdTool = CreateUmbracoReadTool(
  "get-document-version-by-id",
  "Get specific document version by ID",
  getDocumentVersionByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentVersionById(id);

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

export default GetDocumentVersionByIdTool;