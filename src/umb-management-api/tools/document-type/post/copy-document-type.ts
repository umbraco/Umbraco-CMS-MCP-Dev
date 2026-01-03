import { UmbracoManagementClient } from "@umb-management-client";
import { CopyDocumentTypeRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import {
  postDocumentTypeByIdCopyParams,
  postDocumentTypeByIdCopyBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";

const copyDocumentTypeSchema = {
  id: postDocumentTypeByIdCopyParams.shape.id,
  data: z.object(postDocumentTypeByIdCopyBody.shape),
};

export const copyDocumentTypeOutputSchema = z.object({
  id: z.string().uuid()
});

const CopyDocumentTypeTool = {
  name: "copy-document-type",
  description: "Copy a document type to a new location. Returns the new document type's ID on success.",
  inputSchema: copyDocumentTypeSchema,
  outputSchema: copyDocumentTypeOutputSchema.shape,
  slices: ['copy'],
  handler: (async (model: { id: string; data: CopyDocumentTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();

    const response = await client.postDocumentTypeByIdCopy(model.id, model.data, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract new ID from Location header: /umbraco/management/api/v1/document-type/{guid}
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
} satisfies ToolDefinition<typeof copyDocumentTypeSchema, typeof copyDocumentTypeOutputSchema.shape>;

export default withStandardDecorators(CopyDocumentTypeTool);
