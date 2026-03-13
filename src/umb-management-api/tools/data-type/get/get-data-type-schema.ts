import { getDataTypeByIdSchemaParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Custom output schema - the generated one is too strict for JSON Schema content
const outputSchema = z.object({
  valueTypeName: z.string().nullish(),
  jsonSchema: z.unknown().nullish(),
});

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
    return executeGetApiCall((client) =>
      client.getDataTypeByIdSchema(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getDataTypeByIdSchemaParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDataTypeSchemaTool);
