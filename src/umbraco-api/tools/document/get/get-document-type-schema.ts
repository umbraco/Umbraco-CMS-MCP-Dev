import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentTypeByIdSchemaParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  type HttpResponse,
  CAPTURE_RAW_HTTP_RESPONSE,
  UmbracoApiError,
  createToolResult,
  toProblemDetails,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
    const client = UmbracoManagementClient.getClient();
    const response = (await client.getDocumentTypeByIdSchema(
      id,
      CAPTURE_RAW_HTTP_RESPONSE
    )) as unknown as HttpResponse;
    // Surface non-2xx responses (e.g. 404 ProblemDetails) as an error result,
    // the same way executeGetApiCall does, instead of wrapping them as a schema.
    if (typeof response.status !== "number") {
      // Mirrors the SDK's own validateApiResponse warning: an HttpResponse should
      // always carry a numeric status when CAPTURE_RAW_HTTP_RESPONSE is honored, so
      // this means the client/transport shape has changed under us. We can't tell
      // success from failure here, so fall through as before, but make it loud.
      console.warn(
        "[get-document-type-schema] API response had no numeric status; treating as success. Did the generated client's CAPTURE_RAW_HTTP_RESPONSE wiring change?"
      );
    } else if (response.status < 200 || response.status >= 300) {
      throw new UmbracoApiError(toProblemDetails(response));
    }
    return createToolResult({ schema: response.data });
  },
} satisfies ToolDefinition<typeof getDocumentTypeByIdSchemaParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentTypeSchemaTool);
