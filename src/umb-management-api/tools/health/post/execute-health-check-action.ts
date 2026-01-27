import { postHealthCheckExecuteActionBody, postHealthCheckExecuteActionResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { HealthCheckActionRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const ExecuteHealthCheckActionTool = {
  name: "execute-health-check-action",
  description: "Executes remedial actions for health issues. WARNING: This performs system remedial actions that may modify system configuration, files, or database content. Use with caution.",
  inputSchema: postHealthCheckExecuteActionBody.shape,
  outputSchema: postHealthCheckExecuteActionResponse.shape,
  slices: ['diagnostics'],
  handler: (async (model: HealthCheckActionRequestModel) => {
    return executeGetApiCall((client) =>
      client.postHealthCheckExecuteAction(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postHealthCheckExecuteActionBody.shape, typeof postHealthCheckExecuteActionResponse.shape>;

export default withStandardDecorators(ExecuteHealthCheckActionTool);
