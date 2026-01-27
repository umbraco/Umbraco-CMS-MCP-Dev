import { getModelsBuilderDashboardResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const emptySchema = z.object({});

const GetModelsBuilderDashboardTool = {
  name: "get-models-builder-dashboard",
  description: `Gets Models Builder dashboard information and current status.
  Returns an object containing:
  - mode: The Models Builder mode, one of: 'Nothing', 'InMemoryAuto', 'SourceCodeManual', 'SourceCodeAuto' (string)
  - canGenerate: Whether models can be generated (boolean)
  - outOfDateModels: Whether models are out of date (boolean)
  - lastError: Last error message if any (string | null)
  - version: Version information (string | null)
  - modelsNamespace: Namespace for generated models (string | null)
  - trackingOutOfDateModels: Whether tracking is enabled (boolean)`,
  inputSchema: emptySchema.shape,
  outputSchema: getModelsBuilderDashboardResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['diagnostics'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getModelsBuilderDashboard(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof emptySchema.shape, typeof getModelsBuilderDashboardResponse.shape>;

export default withStandardDecorators(GetModelsBuilderDashboardTool);
