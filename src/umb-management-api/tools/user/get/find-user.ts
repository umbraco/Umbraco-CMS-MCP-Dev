import { getFilterUserQueryParams, getFilterUserResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetFilterUserParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const FindUserTool = {
  name: "find-user",
  description: "Finds users by filtering with name, email, or other criteria",
  inputSchema: getFilterUserQueryParams.shape,
  outputSchema: getFilterUserResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (params: GetFilterUserParams) => {
    return executeGetApiCall((client) =>
      client.getFilterUser(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getFilterUserQueryParams.shape, typeof getFilterUserResponse.shape>;

export default withStandardDecorators(FindUserTool);
