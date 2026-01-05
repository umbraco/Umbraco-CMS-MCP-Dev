import { getUserConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetUserConfigurationTool = {
  name: "get-user-configuration",
  description: "Gets user configuration settings including user invitation settings and password requirements",
  inputSchema: {},
  outputSchema: getUserConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getUserConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getUserConfigurationResponse.shape>;

export default withStandardDecorators(GetUserConfigurationTool);
