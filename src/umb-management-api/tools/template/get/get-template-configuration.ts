import { getTemplateConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateConfigurationTool = {
  name: "get-template-configuration",
  description: "Gets template configuration settings including whether templates are disabled system-wide",
  inputSchema: {},
  outputSchema: getTemplateConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getTemplateConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getTemplateConfigurationResponse.shape>;

export default withStandardDecorators(GetTemplateConfigurationTool);