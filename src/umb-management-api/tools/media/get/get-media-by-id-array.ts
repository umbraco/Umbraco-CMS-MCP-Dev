import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemMediaParams } from "@/umb-management-api/schemas/index.js";
import {
  getItemMediaQueryParams,
  getItemMediaResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResult,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemMediaResponse,
});

const GetMediaByIdArrayTool = {
  name: "get-media-by-id-array",
  description: "Gets media items by an array of IDs",
  inputSchema: getItemMediaQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: GetItemMediaParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemMedia(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMediaQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaByIdArrayTool);
