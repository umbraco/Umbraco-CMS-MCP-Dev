import {
  getItemMemberGroupQueryParams,
  getItemMemberGroupResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemMemberGroupParams } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getItemMemberGroupResponse,
});

const GetMemberGroupByIdArrayTool = {
  name: "get-member-group-by-id-array",
  description: "Gets member groups by an array of IDs",
  inputSchema: getItemMemberGroupQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemMemberGroupParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemMemberGroup(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMemberGroupQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMemberGroupByIdArrayTool);
