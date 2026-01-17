import { getTemplateQuerySettingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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