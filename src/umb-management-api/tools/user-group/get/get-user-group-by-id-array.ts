import { GetItemUserGroupParams } from "@/umb-management-api/schemas/index.js";
import {
  getItemUserGroupQueryParams,
  getItemUserGroupResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
