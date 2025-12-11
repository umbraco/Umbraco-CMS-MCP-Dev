import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTreeDocumentTypeSiblingsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeSiblingsTool = CreateUmbracoReadTool(
  "get-document-type-siblings",
  "Gets sibling document types or document type folders for a given descendant id",
  getTreeDocumentTypeSiblingsQueryParams.shape,
  async (params: GetTreeDocumentTypeSiblingsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentTypeSiblings(params);

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

export default GetDocumentTypeSiblingsTool;
