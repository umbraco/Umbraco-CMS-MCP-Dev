import { getTemplateQuerySettingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateQuerySettingsTool = {
  name: "get-template-query-settings",
  description: "Returns schema for template queries: available document types, properties, and operators",
  inputSchema: {},
  outputSchema: getTemplateQuerySettingsResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getTemplateQuerySettings(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getTemplateQuerySettingsResponse.shape>;

export default withStandardDecorators(GetTemplateQuerySettingsTool);