import { getHealthCheckGroupQueryParams, getHealthCheckGroupResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
