import { UmbracoManagementClient } from "@umb-management-client";
import { CreateDocumentBlueprintFromDocumentRequestModel, CurrentUserResponseModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
  type HttpResponse,
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

export const createDocumentBlueprintFromDocumentOutputSchema = z.object({
  id: z.string().guid()
});

type CreateDocumentBlueprintFromDocumentModel = z.infer<typeof createDocumentBlueprintFromDocumentSchema>;

const CreateDocumentBlueprintFromDocumentTool = {
  name: "create-document-blueprint-from-document",
  description: `Create a new document blueprint from an existing document
  Use this to create a blueprint template based on an existing document, preserving its structure and content for reuse.

  Note: Blueprints created from documents are always created at the root level. Use the move-document-blueprint tool to relocate them to folders after creation if needed.`,
  inputSchema: createDocumentBlueprintFromDocumentSchema.shape,
  outputSchema: createDocumentBlueprintFromDocumentOutputSchema.shape,
  slices: ['create'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes("Umb.Document.CreateBlueprint"),
  handler: (async (model: CreateDocumentBlueprintFromDocumentModel) => {
    const payload: CreateDocumentBlueprintFromDocumentRequestModel = {
      document: model.document,
      id: model.id ?? undefined,
      name: model.name,
      parent: undefined,
    };

    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentBlueprintFromDocument(payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as HttpResponse<ProblemDetails | void>;

    if (response.status >= 200 && response.status < 300) {
      const locationHeader = response.headers?.['location'] || response.headers?.['Location'];
      let createdId = model.id ?? '';
      if (locationHeader) {
        const idMatch = locationHeader.match(/document-blueprint\/([a-f0-9-]+)$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({ id: createdId });
    }

    const errorData: ProblemDetails = response.data || {
      status: response.status,
      detail: response.statusText,
    };
    return createToolResultError(errorData);
  }),
} satisfies ToolDefinition<typeof createDocumentBlueprintFromDocumentSchema.shape, typeof createDocumentBlueprintFromDocumentOutputSchema.shape>;

export default withStandardDecorators(CreateDocumentBlueprintFromDocumentTool);
