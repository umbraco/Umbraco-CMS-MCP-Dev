import { getHealthCheckGroupQueryParams, getHealthCheckGroupResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetHealthCheckGroupsTool = {
  name: "get-health-check-groups",
  description: "Gets a paged list of health check groups for system monitoring",
  inputSchema: getHealthCheckGroupQueryParams.shape,
  outputSchema: getHealthCheckGroupResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (params: { skip?: number; take?: number }) => {
    return executeGetApiCall((client) =>
      client.getHealthCheckGroup(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getHealthCheckGroupQueryParams.shape, typeof getHealthCheckGroupResponse.shape>;

export default withStandardDecorators(GetHealthCheckGroupsTool);
