import { GetItemUserGroupParams } from "@/umb-management-api/schemas/index.js";
import {
  getItemUserGroupQueryParams,
  getItemUserGroupResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getItemUserGroupResponse,
});

const GetUserGroupByIdArrayTool = {
  name: "get-user-group-by-id-array",
  description: "Gets user groups by an array of IDs",
  inputSchema: getItemUserGroupQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetItemUserGroupParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemUserGroup(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemUserGroupQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetUserGroupByIdArrayTool);
