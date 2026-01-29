import { getMediaConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaConfigurationTool = {
  name: "get-media-configuration",
  description: "Gets the media configuration for the Umbraco instance.",
  inputSchema: {},
  outputSchema: getMediaConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getMediaConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getMediaConfigurationResponse.shape>;

export default withStandardDecorators(GetMediaConfigurationTool);
