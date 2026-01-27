import { getModelsBuilderStatusResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const emptySchema = z.object({});

const GetModelsBuilderStatusTool = {
  name: "get-models-builder-status",
  description: `Gets the out-of-date status of Models Builder models.
  Returns an object containing:
  - status: The out-of-date status, one of: 'OutOfDate', 'Current', 'Unknown' (string)`,
  inputSchema: emptySchema.shape,
  outputSchema: getModelsBuilderStatusResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['diagnostics'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getModelsBuilderStatus(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof emptySchema.shape, typeof getModelsBuilderStatusResponse.shape>;

export default withStandardDecorators(GetModelsBuilderStatusTool);
