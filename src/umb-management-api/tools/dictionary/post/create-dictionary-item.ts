import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateDictionaryItemRequestModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";

const createDictionarySchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().uuid().optional(),
  translations: z.array(z.object({
    isoCode: z.string().min(1, "ISO code is required"),
    translation: z.string()
  })),
  id: z.string().uuid().nullish()
});

type CreateDictionarySchema = z.infer<typeof createDictionarySchema>;

const CreateDictionaryItemTool = CreateUmbracoTool(
  "create-dictionary",
  `Creates a new dictionary item.`,
  createDictionarySchema.shape,
  async (model: CreateDictionarySchema) => {
    const client = UmbracoManagementClient.getClient();

    // Transform: flat parentId -> nested parent object for API
    const payload: CreateDictionaryItemRequestModel = {
      name: model.name,
      parent: model.parentId ? { id: model.parentId } : undefined,
      translations: model.translations,
      id: model.id
    };

    var response = await client.postDictionary(payload);

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

export default CreateDictionaryItemTool;
