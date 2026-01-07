import { getMediaTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const emptySchema = z.object({});

const GetMediaTypeConfigurationTool = {
  name: "get-media-type-configuration",
  description: "Gets the configuration for media types",
  inputSchema: emptySchema.shape,
  outputSchema: getMediaTypeConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getMediaTypeConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof emptySchema.shape, typeof getMediaTypeConfigurationResponse.shape>;

export default withStandardDecorators(GetMediaTypeConfigurationTool);
