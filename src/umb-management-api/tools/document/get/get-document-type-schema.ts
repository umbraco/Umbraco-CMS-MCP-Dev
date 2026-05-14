import { getDocumentTypeByIdSchemaParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  createToolResult,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import { isUmbracoAtLeast } from "../../../runtime-context.js";
import { getDocumentTypeSchemaFromApi } from "./get-document-type-schema-modern.js";
import { synthesizeDocumentTypeSchema } from "./get-document-type-schema-legacy.js";

// Wrap the JSON Schema in an object so MCP structured output validation works
export const documentTypeSchemaOutputSchema = z.object({
  schema: z.unknown(),
});
const outputSchema = documentTypeSchemaOutputSchema;

const GetDocumentTypeSchemaTool = {
  name: "get-document-type-schema",
  description: `Gets the JSON Schema for a document type by Id.

Returns a complete JSON Schema describing the structure for creating documents of that type, including all property definitions and their value formats.

IMPORTANT: Use this tool BEFORE creating documents to understand the expected property structure for a specific document type.`,
  inputSchema: getDocumentTypeByIdSchemaParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const result = isUmbracoAtLeast(17, 4)
      ? await getDocumentTypeSchemaFromApi(id)
      : await synthesizeDocumentTypeSchema(id);
    return createToolResult(result);
  },
} satisfies ToolDefinition<typeof getDocumentTypeByIdSchemaParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeSchemaTool);
