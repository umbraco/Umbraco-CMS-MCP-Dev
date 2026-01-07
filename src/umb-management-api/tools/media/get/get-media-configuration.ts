import { getMediaConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
