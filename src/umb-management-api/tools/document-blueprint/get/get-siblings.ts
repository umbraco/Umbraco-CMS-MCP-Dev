import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getTreeDocumentBlueprintSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentBlueprintSiblingsTool = CreateUmbracoTool(
  "get-document-blueprint-siblings",
  "Gets sibling document blueprints for a given descendant id",
  getTreeDocumentBlueprintSiblingsQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentBlueprintSiblings(params);
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

export default GetDocumentBlueprintSiblingsTool;
