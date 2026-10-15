import { UmbracoManagementClient } from "@umb-management-client";
import { getDataTypeByIdSchemaParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
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

// Custom output schema - the generated one is too strict for JSON Schema content
export const dataTypeSchemaOutputSchema = z.object({
  valueTypeName: z.string().nullish(),
  jsonSchema: z.unknown().nullish(),
});
const outputSchema = dataTypeSchemaOutputSchema;

const GetDataTypeSchemaTool = {
  name: "get-data-type-schema",
  description: `Gets the JSON Schema for a data type by Id.

Returns a JSON Schema describing the value structure for the specified data type, including its configured property editor settings.

IMPORTANT: Use this tool BEFORE creating data types to understand the expected configuration structure for a specific property editor.`,
  inputSchema: getDataTypeByIdSchemaParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = (await client.getDataTypeByIdSchema(
      id,
      CAPTURE_RAW_HTTP_RESPONSE
    )) as unknown as HttpResponse;
    // Surface non-2xx responses (e.g. 404 ProblemDetails) as an error result,
    // the same way executeGetApiCall does, instead of wrapping them as a schema.
    if (typeof response.status === "number" && (response.status < 200 || response.status >= 300)) {
      throw new UmbracoApiError(toProblemDetails(response));
    }
    return createToolResult(response.data ?? {});
  },
} satisfies ToolDefinition<typeof getDataTypeByIdSchemaParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDataTypeSchemaTool);
