import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { postDocumentTypeAvailableCompositionsBody, postDocumentTypeAvailableCompositionsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentTypeAvailableCompositions(model);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof postDocumentTypeAvailableCompositionsBody.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeAvailableCompositionsTool);
