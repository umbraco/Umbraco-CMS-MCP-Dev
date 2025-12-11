import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getRecycleBinDocumentReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetRecycleBinDocumentReferencedByTool = CreateUmbracoReadTool(
  "get-recycle-bin-document-referenced-by",
  `Get references to deleted document items in the recycle bin
  Use this to find content that still references deleted document items before permanently deleting them.`,
  getRecycleBinDocumentReferencedByQueryParams.shape,
  async ({ skip, take }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinDocumentReferencedBy({ skip, take });
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

export default GetRecycleBinDocumentReferencedByTool;