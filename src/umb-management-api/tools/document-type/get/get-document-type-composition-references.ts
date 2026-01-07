import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeByIdCompositionReferencesParams, getDocumentTypeByIdCompositionReferencesResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

const outputSchema = z.object({
  items: getDocumentTypeByIdCompositionReferencesResponse,
});

const GetDocumentTypeCompositionReferencesTool = {
  name: "get-document-type-composition-references",
  description: "Gets the composition references for a document type",
  inputSchema: getDocumentTypeByIdCompositionReferencesParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['references'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetItemsApiCall((client) =>
      client.getDocumentTypeByIdCompositionReferences(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeByIdCompositionReferencesParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeCompositionReferencesTool);
