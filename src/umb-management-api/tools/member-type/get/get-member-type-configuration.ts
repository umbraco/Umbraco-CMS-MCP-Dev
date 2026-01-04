import { getMemberTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const emptySchema = z.object({});

const GetMemberTypeConfigurationTool = {
  name: "get-member-type-configuration",
  description: "Gets the configuration for member types",
  inputSchema: emptySchema.shape,
  outputSchema: getMemberTypeConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getMemberTypeConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof emptySchema.shape, typeof getMemberTypeConfigurationResponse.shape>;

export default withStandardDecorators(GetMemberTypeConfigurationTool);
