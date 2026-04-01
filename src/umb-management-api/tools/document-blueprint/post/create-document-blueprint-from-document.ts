import { CreateDocumentBlueprintFromDocumentRequestModel, CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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

const CreateDocumentBlueprintFromDocumentTool = {
  name: "create-document-blueprint-from-document",
  description: `Create a new document blueprint from an existing document
  Use this to create a blueprint template based on an existing document, preserving its structure and content for reuse.

  Note: Blueprints created from documents are always created at the root level. Use the move-document-blueprint tool to relocate them to folders after creation if needed.`,
  inputSchema: createDocumentBlueprintFromDocumentSchema.shape,
  slices: ['create'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes("Umb.Document.CreateBlueprint"),
  handler: (async (model: CreateDocumentBlueprintFromDocumentModel) => {
    const payload: CreateDocumentBlueprintFromDocumentRequestModel = {
      document: model.document,
      id: model.id ?? undefined,
      name: model.name,
      parent: undefined,
    };

    return executeVoidApiCall((client) =>
      client.postDocumentBlueprintFromDocument(payload, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof createDocumentBlueprintFromDocumentSchema.shape>;

export default withStandardDecorators(CreateDocumentBlueprintFromDocumentTool);
