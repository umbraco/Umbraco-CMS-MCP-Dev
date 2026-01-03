import { UmbracoManagementClient } from "@umb-management-client";
import { CreateDictionaryItemRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { AxiosResponse } from "axios";

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

export const createDictionaryOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateDictionaryItemTool = {
  name: "create-dictionary",
  description: `Creates a new dictionary item.`,
  inputSchema: createDictionarySchema.shape,
  outputSchema: createDictionaryOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateDictionarySchema) => {
    const client = UmbracoManagementClient.getClient();

    // Transform: flat parentId -> nested parent object for API
    const payload: CreateDictionaryItemRequestModel = {
      name: model.name,
      parent: model.parentId ? { id: model.parentId } : undefined,
      translations: model.translations,
      id: model.id
    };

    const response = await client.postDictionary(payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = model.id || '';
      if (locationHeader) {
        const idMatch = locationHeader.match(/([0-9a-f-]{36})$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "Dictionary item created successfully",
        id: createdId
      });
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof createDictionarySchema.shape, typeof createDictionaryOutputSchema.shape>;

export default withStandardDecorators(CreateDictionaryItemTool);
