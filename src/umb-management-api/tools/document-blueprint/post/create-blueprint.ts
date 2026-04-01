import { UmbracoManagementClient } from "@umb-management-client";
import { CreateDocumentBlueprintRequestModel, CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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

const CreateDocumentBlueprintTool = {
  name: "create-document-blueprint",
  description: `Creates a new document blueprint.`,
  inputSchema: createDocumentBlueprintSchema.shape,
  slices: ['create'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes("Umb.Document.CreateBlueprint"),
  handler: (async (model: CreateDocumentBlueprintSchema) => {
    // Transform: flat parentId -> nested parent object for API
    const payload: CreateDocumentBlueprintRequestModel = {
      values: model.values,
      variants: model.variants,
      documentType: model.documentType,
      id: model.id,
      parent: model.parentId ? { id: model.parentId } : undefined,
    };

    return executeVoidApiCall((client) =>
      client.postDocumentBlueprint(payload, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof createDocumentBlueprintSchema.shape>;

export default withStandardDecorators(CreateDocumentBlueprintTool);
