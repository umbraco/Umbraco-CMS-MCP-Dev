import { getElementConfigurationResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementConfigurationTool = {
  name: "get-element-configuration",
  description: "Gets the element configuration for the Umbraco instance.",
  inputSchema: {},
  outputSchema: getElementConfigurationResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getElementConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getElementConfigurationResponse.shape>;

export default withStandardDecorators(GetElementConfigurationTool);
