import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getRecycleBinDocumentByIdOriginalParentParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetRecycleBinDocumentOriginalParentTool = CreateUmbracoTool(
  "get-recycle-bin-document-original-parent",
  `Get the original parent location of a document item in the recycle bin
  Returns information about where the document item was located before deletion.`,
  getRecycleBinDocumentByIdOriginalParentParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinDocumentByIdOriginalParent(id);
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

export default GetRecycleBinDocumentOriginalParentTool;