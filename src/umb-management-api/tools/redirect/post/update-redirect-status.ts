import { postRedirectManagementStatusQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

type SchemaParams = z.infer<typeof postRedirectManagementStatusQueryParams>;

const UpdateRedirectStatusTool = {
  name: "update-redirect-status",
  description: `Updates the status of redirect management.
  Parameters:
  - status: The new status, either "Enabled" or "Disabled" (string)`,
  inputSchema: postRedirectManagementStatusQueryParams.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  handler: (async ({ status }: SchemaParams) => {
    return executeVoidApiCall((client) =>
      client.postRedirectManagementStatus({ status }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postRedirectManagementStatusQueryParams.shape>;

export default withStandardDecorators(UpdateRedirectStatusTool);
