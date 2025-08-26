import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { getTreeDocumentBlueprintRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentBlueprintRootTool = CreateUmbracoTool(
  "get-document-blueprint-root",
  "Gets the root level of the document blueprint tree",
  getTreeDocumentBlueprintRootQueryParams.shape,
  async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDocumentBlueprintRoot(params);
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

export default GetDocumentBlueprintRootTool;
