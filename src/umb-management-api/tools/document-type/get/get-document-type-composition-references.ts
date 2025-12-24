import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { getDocumentTypeByIdCompositionReferencesParams, getDocumentTypeByIdCompositionReferencesResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeByIdCompositionReferences(id);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getDocumentTypeByIdCompositionReferencesParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeCompositionReferencesTool);
