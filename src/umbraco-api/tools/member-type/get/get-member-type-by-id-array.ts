import { getItemMemberTypeQueryParams, getItemMemberTypeResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { GetItemMemberTypeParams } from "@/umbraco-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getItemMemberTypeResponse,
});

const GetMemberTypesByIdArrayTool = {
  name: "get-member-types-by-id-array",
  description: "Gets member types by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemMemberTypeQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetItemMemberTypeParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemMemberType(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMemberTypeQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMemberTypesByIdArrayTool);
