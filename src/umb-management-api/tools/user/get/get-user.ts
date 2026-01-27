import { GetUserParams } from "@/umb-management-api/schemas/index.js";
import { getUserQueryParams, getUserResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetUserTool = {
  name: "get-user",
  description: "Lists users with pagination and filtering options",
  inputSchema: getUserQueryParams.shape,
  outputSchema: getUserResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetUserParams) => {
    return executeGetApiCall((client) =>
      client.getUser(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getUserQueryParams.shape, typeof getUserResponse.shape>;

export default withStandardDecorators(GetUserTool);
