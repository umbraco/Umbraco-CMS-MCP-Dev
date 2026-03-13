import { GetDataTypeSchemaParams } from "@/umb-management-api/schemas/index.js";
import { getDataTypeSchemaQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Custom output schema - the generated one is too strict for JSON Schema content
const outputSchema = z.object({
  total: z.number(),
  items: z.array(z.object({
    id: z.string().uuid(),
    valueTypeName: z.string().nullish(),
    jsonSchema: z.unknown().nullish(),
    error: z.string().nullish(),
  })),
});

const GetDataTypeSchemasTool = {
  name: "get-data-type-schemas",
  description: `Gets JSON Schemas for multiple data types in a single batch request.

Returns JSON Schemas describing the value structure for each specified data type. This is more efficient than calling get-data-type-schema multiple times when you need schemas for several data types.`,
  inputSchema: getDataTypeSchemaQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: async (model: GetDataTypeSchemaParams) => {
    return executeGetApiCall((client) =>
      client.getDataTypeSchema(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  },
} satisfies ToolDefinition<typeof getDataTypeSchemaQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDataTypeSchemasTool);
