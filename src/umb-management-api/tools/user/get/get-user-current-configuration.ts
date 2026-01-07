import { getUserCurrentConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetUserCurrentConfigurationTool = {
  name: "get-user-current-configuration",
  description: "Gets current user configuration settings including login preferences and password requirements",
  inputSchema: {},
  outputSchema: getUserCurrentConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['current-user'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getUserCurrentConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getUserCurrentConfigurationResponse.shape>;

export default withStandardDecorators(GetUserCurrentConfigurationTool);
