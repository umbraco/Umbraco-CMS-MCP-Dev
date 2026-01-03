import { z } from "zod";
import { UmbracoManagementClient } from "@umb-management-client";
import { CopyDocumentRequestModel, CurrentUserResponseModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { AxiosResponse } from "axios";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const copyDocumentSchema = z.object({
  parentId: z.string().uuid("Must be a valid document UUID of the parent node").optional(),
  idToCopy: z.string().uuid("Must be a valid document UUID that belongs to the parent document's children"),
  relateToOriginal: z.boolean().describe("Relate the copy to the original document. This is usually set to false unless specified."),
  includeDescendants: z.boolean().describe("If true, all descendant documents (children, grandchildren, etc.) will also be copied. This is usually set to false unless specified."),
});

export const copyDocumentOutputSchema = z.object({
  id: z.string().uuid()
});

const CopyDocumentTool = {
  name: "copy-document",
  description: `Copy a document to a new location. Returns the new document's ID on success.
  This is also the recommended way to create new documents.
  Copy an existing document to preserve the complex JSON structure, then modify specific fields as needed.

  WORKFLOW NOTES:
  - The copy is created as a draft with the naming pattern "Original Name (N)" where N is a number
  - Use the returned ID for subsequent update and publish operations

  Example workflows:
  1. Copy only: copy-document (creates draft copy, returns new ID)
  2. Copy and update: copy-document → update-document → publish-document`,
  inputSchema: copyDocumentSchema.shape,
  outputSchema: copyDocumentOutputSchema.shape,
  slices: ['copy'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Duplicate),
  handler: (async (model: z.infer<typeof copyDocumentSchema>) => {
    const client = UmbracoManagementClient.getClient();

    const payload: CopyDocumentRequestModel = {
      target: model.parentId ? {
        id: model.parentId,
      } : undefined,
      relateToOriginal: model.relateToOriginal,
      includeDescendants: model.includeDescendants,
    };

    const response = await client.postDocumentByIdCopy(model.idToCopy, payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract new ID from Location header: /umbraco/management/api/v1/document/{guid}
      const location = response.headers?.location || '';
      const newId = location.split('/').pop() || '';

      const output = { id: newId };
      return createToolResult(output);
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof copyDocumentSchema.shape, typeof copyDocumentOutputSchema.shape>;

export default withStandardDecorators(CopyDocumentTool);
