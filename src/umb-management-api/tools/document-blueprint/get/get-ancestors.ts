import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeDocumentBlueprintAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentBlueprintAncestorsTool = CreateUmbracoReadTool(
  "get-document-blueprint-ancestors",
  "Gets the ancestors of a document blueprint by Id",
  getTreeDocumentBlueprintAncestorsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDocumentBlueprintAncestors(params);
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

export default GetDocumentBlueprintAncestorsTool;
