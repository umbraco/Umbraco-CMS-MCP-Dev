import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CurrentUserResponseModel, CreateDocumentBlueprintFromDocumentRequestModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";

// Note: The Umbraco API schema includes a 'parent' parameter, but testing shows it is not
// respected by the API - blueprints created from documents are always created at the root level.
// Therefore we exclude the parent parameter from this tool to avoid confusion.
const createDocumentBlueprintFromDocumentSchema = z.object({
  document: z.object({
    id: z.string().uuid()
  }),
  id: z.string().uuid().optional(),
  name: z.string()
});

type CreateDocumentBlueprintFromDocumentModel = z.infer<typeof createDocumentBlueprintFromDocumentSchema>;

const CreateDocumentBlueprintFromDocumentTool = CreateUmbracoTool(
  "create-document-blueprint-from-document",
  `Create a new document blueprint from an existing document
  Use this to create a blueprint template based on an existing document, preserving its structure and content for reuse.

  Note: Blueprints created from documents are always created at the root level. Use the move-document-blueprint tool to relocate them to folders after creation if needed.`,
  createDocumentBlueprintFromDocumentSchema.shape,
  async (model: CreateDocumentBlueprintFromDocumentModel) => {
    const client = UmbracoManagementClient.getClient();

    const payload: CreateDocumentBlueprintFromDocumentRequestModel = {
      document: model.document,
      id: model.id ?? undefined,
      name: model.name,
      parent: undefined,
    };

    const response = await client.postDocumentBlueprintFromDocument(payload);
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