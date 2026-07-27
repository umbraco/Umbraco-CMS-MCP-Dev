import { getDataTypeByIdSchemaParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  createToolResult,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import { isUmbracoAtLeast } from "../../../runtime-context.js";
import { getDataTypeSchemaFromApi } from "./get-data-type-schema-modern.js";
import { synthesizeDataTypeSchema } from "./get-data-type-schema-legacy.js";

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
    const result = isUmbracoAtLeast(17, 4)
      ? await getDataTypeSchemaFromApi(id)
      : await synthesizeDataTypeSchema(id);
    return createToolResult(result);
  },
} satisfies ToolDefinition<typeof getDataTypeByIdSchemaParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDataTypeSchemaTool);
