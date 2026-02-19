import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentTypeByIdSchemaParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResult,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import { AxiosResponse } from "axios";

// Wrap the JSON Schema in an object so MCP structured output validation works
const outputSchema = z.object({
  schema: z.unknown(),
});

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeByIdSchema(id, CAPTURE_RAW_HTTP_RESPONSE) as unknown as AxiosResponse;
    return createToolResult({ schema: response.data });
  },
} satisfies ToolDefinition<typeof getDocumentTypeByIdSchemaParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeSchemaTool);
