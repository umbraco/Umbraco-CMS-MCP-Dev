import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postDocumentBlueprintFromDocumentBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";

const CreateDocumentBlueprintFromDocumentTool = CreateUmbracoTool(
  "create-document-blueprint-from-document",
  `Create a new document blueprint from an existing document
  Use this to create a blueprint template based on an existing document, preserving its structure and content for reuse.`,
  postDocumentBlueprintFromDocumentBody.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentBlueprintFromDocument(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes("Umb.Document.CreateBlueprint")
);

export default CreateDocumentBlueprintFromDocumentTool;