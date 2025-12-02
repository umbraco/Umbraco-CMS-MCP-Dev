import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getRecycleBinDocumentSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentRecycleBinSiblingsTool = CreateUmbracoTool(
  "get-document-recycle-bin-siblings",
  "Gets sibling documents in the recycle bin for a given descendant id",
  getRecycleBinDocumentSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRecycleBinDocumentSiblings(params);
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

export default GetDocumentRecycleBinSiblingsTool;
