import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeDocumentSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentSiblingsTool = CreateUmbracoReadTool(
  "get-document-siblings",
  "Gets sibling documents for a given descendant id",
  getTreeDocumentSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentSiblings(params);
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

export default GetDocumentSiblingsTool;
