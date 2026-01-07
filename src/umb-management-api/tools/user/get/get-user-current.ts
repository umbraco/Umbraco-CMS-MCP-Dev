import { getUserCurrentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetUserCurrentTool = {
  name: "get-user-current",
  description: "Gets the current authenticated user's information",
  inputSchema: {},
  outputSchema: getUserCurrentResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['current-user'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getUserCurrent(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getUserCurrentResponse.shape>;

export default withStandardDecorators(GetUserCurrentTool);
