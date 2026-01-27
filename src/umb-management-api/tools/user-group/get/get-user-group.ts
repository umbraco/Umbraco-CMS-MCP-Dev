import { getUserGroupByIdParams, getUserGroupByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserGroupTool = {
  name: "get-user-group",
  description: "Gets a user group by Id",
  inputSchema: getUserGroupByIdParams.shape,
  outputSchema: getUserGroupByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getUserGroupById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserGroupByIdParams.shape, typeof getUserGroupByIdResponse.shape>;

export default withStandardDecorators(GetUserGroupTool);
