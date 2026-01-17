import { getMemberConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const emptySchema = z.object({});

const GetMemberConfigurationTool = {
  name: "get-member-configuration",
  description: "Gets member configuration including reserved field names",
  inputSchema: emptySchema.shape,
  outputSchema: getMemberConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getMemberConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof emptySchema.shape, typeof getMemberConfigurationResponse.shape>;

export default withStandardDecorators(GetMemberConfigurationTool);
