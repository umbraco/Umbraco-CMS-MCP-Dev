import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { GetTreeDocumentTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeAncestorsTool = CreateUmbracoTool(
  "get-document-type-ancestors",
  "Gets the ancestors of a document type",
  getTreeDocumentTypeAncestorsQueryParams.shape,
  async (params: GetTreeDocumentTypeAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentTypeAncestors(params);

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

export default GetDocumentTypeAncestorsTool;
