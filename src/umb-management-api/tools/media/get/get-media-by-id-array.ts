import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemMediaParams } from "@/umb-management-api/schemas/index.js";
import {
  getItemMediaQueryParams,
  getItemMediaResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMedia(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemMediaQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaByIdArrayTool);
