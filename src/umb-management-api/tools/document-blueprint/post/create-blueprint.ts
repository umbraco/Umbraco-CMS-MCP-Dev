import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CurrentUserResponseModel, CreateDocumentBlueprintRequestModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";

// Flattened schema - prevents LLM JSON stringification of parent object
const createDocumentBlueprintSchema = z.object({
  values: z.array(z.object({
    culture: z.string().nullish(),
    segment: z.string().nullish(),
    alias: z.string().min(1),
    value: z.any().nullish()
  })),
  variants: z.array(z.object({
    culture: z.string().nullish(),
    segment: z.string().nullish(),
    name: z.string().min(1)
  })),
  documentType: z.object({
    id: z.string().uuid()
  }),
  id: z.string().uuid().nullish(),
  parentId: z.string().uuid().optional()  // Flattened parent ID
});

type CreateDocumentBlueprintSchema = z.infer<typeof createDocumentBlueprintSchema>;

const CreateDocumentBlueprintTool = CreateUmbracoTool(
  "create-document-blueprint",
  `Creates a new document blueprint.`,
  createDocumentBlueprintSchema.shape,
  async (model: CreateDocumentBlueprintSchema) => {
    const client = UmbracoManagementClient.getClient();

    // Transform: flat parentId -> nested parent object for API
    const payload: CreateDocumentBlueprintRequestModel = {
      values: model.values,
      variants: model.variants,
      documentType: model.documentType,
      id: model.id,
      parent: model.parentId ? { id: model.parentId } : undefined,
    };

    const response = await client.postDocumentBlueprint(payload);
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

export default CreateDocumentBlueprintTool;
