import { postDocumentTypeAvailableCompositionsBody, postDocumentTypeAvailableCompositionsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

type SchemaParams = z.infer<typeof postDocumentTypeAvailableCompositionsBody>;

const outputSchema = z.object({
  items: postDocumentTypeAvailableCompositionsResponse,
});

const GetDocumentTypeAvailableCompositionsTool = {
  name: "get-document-type-available-compositions",
  description: "Gets the available compositions for a document type",
  inputSchema: postDocumentTypeAvailableCompositionsBody.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (model: SchemaParams) => {
    return executeGetItemsApiCall((client) =>
      client.postDocumentTypeAvailableCompositions(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postDocumentTypeAvailableCompositionsBody.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeAvailableCompositionsTool);
