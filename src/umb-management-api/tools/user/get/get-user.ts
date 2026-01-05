import { GetUserParams } from "@/umb-management-api/schemas/index.js";
import { getUserQueryParams, getUserResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
