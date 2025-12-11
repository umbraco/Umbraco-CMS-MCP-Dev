import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getDocumentBlueprintByIdScaffoldParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetDocumentBlueprintScaffoldTool = CreateUmbracoReadTool(
  "get-document-blueprint-scaffold",
  `Get scaffold information for a document blueprint
  Use this to retrieve the scaffold structure and default values for a document blueprint, typically used when creating new documents from blueprints.`,
  getDocumentBlueprintByIdScaffoldParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentBlueprintByIdScaffold(id);
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

export default GetDocumentBlueprintScaffoldTool;