import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentByIdReferencedByParams, getDocumentByIdReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetDocumentByIdReferencedByTool = CreateUmbracoTool(
  "get-document-by-id-referenced-by",
  `Get items that reference a specific document item
  Use this to find all content, documents, or other items that are currently referencing a specific document item.`,
  z.object({
    ...getDocumentByIdReferencedByParams.shape,
    ...getDocumentByIdReferencedByQueryParams.shape,
  }).shape,
  async ({ id, skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdReferencedBy(id, { skip, take });
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

export default GetDocumentByIdReferencedByTool;