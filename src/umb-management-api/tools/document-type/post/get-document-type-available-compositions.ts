import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postDocumentTypeAvailableCompositionsBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentTypeAvailableCompositionsTool = CreateUmbracoReadTool(
  "get-document-type-available-compositions",
  "Gets the available compositions for a document type",
  postDocumentTypeAvailableCompositionsBody.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentTypeAvailableCompositions(model);

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

export default GetDocumentTypeAvailableCompositionsTool;
