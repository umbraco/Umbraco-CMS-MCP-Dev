import { getItemMediaTypeQueryParams, getItemMediaTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemMediaTypeParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getItemMediaTypeResponse,
});

const GetItemMediaTypeTool = {
  name: "get-item-media-type",
  description: "Gets media type items by their ids",
  inputSchema: getItemMediaTypeQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: GetItemMediaTypeParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMediaType(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemMediaTypeQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetItemMediaTypeTool);
