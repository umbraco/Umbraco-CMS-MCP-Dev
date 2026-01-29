import { getUserByIdParams, getUserByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserByIdTool = {
  name: "get-user-by-id",
  description: "Gets a user by their unique identifier",
  inputSchema: getUserByIdParams.shape,
  outputSchema: getUserByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getUserById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserByIdParams.shape, typeof getUserByIdResponse.shape>;

export default withStandardDecorators(GetUserByIdTool);
