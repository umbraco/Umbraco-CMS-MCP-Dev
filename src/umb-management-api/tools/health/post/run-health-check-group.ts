import { postHealthCheckGroupByNameCheckParams, postHealthCheckGroupByNameCheckResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const RunHealthCheckGroupTool = {
  name: "run-health-check-group",
  description: "Executes health checks for a specific group. WARNING: This will run system diagnostics which may take time and could temporarily affect system performance.",
  inputSchema: postHealthCheckGroupByNameCheckParams.shape,
  outputSchema: postHealthCheckGroupByNameCheckResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (params: { name: string }) => {
    return executeGetApiCall((client) =>
      client.postHealthCheckGroupByNameCheck(params.name, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postHealthCheckGroupByNameCheckParams.shape, typeof postHealthCheckGroupByNameCheckResponse.shape>;

export default withStandardDecorators(RunHealthCheckGroupTool);
