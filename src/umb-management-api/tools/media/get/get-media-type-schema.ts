import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaTypeByIdSchemaParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
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

const GetMediaTypeSchemaTool = {
  name: "get-media-type-schema",
  description: `Gets the JSON Schema for a media type by Id.

Returns a JSON Schema describing the structure for creating media of that type, including all property definitions and their value formats.

IMPORTANT: Use this tool BEFORE creating media to understand the expected property structure for a specific media type.`,
  inputSchema: getMediaTypeByIdSchemaParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeByIdSchema(id, CAPTURE_RAW_HTTP_RESPONSE) as unknown as AxiosResponse;
    return createToolResult({ schema: response.data });
  },
} satisfies ToolDefinition<typeof getMediaTypeByIdSchemaParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaTypeSchemaTool);
