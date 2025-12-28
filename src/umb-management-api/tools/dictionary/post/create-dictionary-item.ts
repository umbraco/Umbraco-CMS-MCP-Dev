import { UmbracoManagementClient } from "@umb-management-client";
import { CreateDictionaryItemRequestModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

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

const CreateDictionaryItemTool = {
  name: "create-dictionary",
  description: `Creates a new dictionary item.`,
  schema: createDictionarySchema.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateDictionarySchema) => {
    const client = UmbracoManagementClient.getClient();

    // Transform: flat parentId -> nested parent object for API
    const payload: CreateDictionaryItemRequestModel = {
      name: model.name,
      parent: model.parentId ? { id: model.parentId } : undefined,
      translations: model.translations,
      id: model.id
    };

    const response = await client.postDictionary(payload);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof createDictionarySchema.shape>;

export default withStandardDecorators(CreateDictionaryItemTool);
