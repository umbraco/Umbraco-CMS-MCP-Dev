import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentAreReferencedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentAreReferencedTool = CreateUmbracoReadTool(
  "get-document-are-referenced",
  `Check if document items are referenced
  Use this to verify if specific document items are being referenced by other content before deletion or modification.`,
  getDocumentAreReferencedQueryParams.shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentAreReferenced({ id, skip, take });
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

export default GetDocumentAreReferencedTool;