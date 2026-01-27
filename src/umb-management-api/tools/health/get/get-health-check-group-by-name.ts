import { getHealthCheckGroupByNameParams, getHealthCheckGroupByNameResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetHealthCheckGroupByNameTool = {
  name: "get-health-check-group-by-name",
  description: "Gets specific health check group details by name for system monitoring",
  inputSchema: getHealthCheckGroupByNameParams.shape,
  outputSchema: getHealthCheckGroupByNameResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['diagnostics'],
  handler: (async (params: { name: string }) => {
    return executeGetApiCall((client) =>
      client.getHealthCheckGroupByName(params.name, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getHealthCheckGroupByNameParams.shape, typeof getHealthCheckGroupByNameResponse.shape>;

export default withStandardDecorators(GetHealthCheckGroupByNameTool);
