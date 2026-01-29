import { getDocumentTypeByIdCompositionReferencesParams, getDocumentTypeByIdCompositionReferencesResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
