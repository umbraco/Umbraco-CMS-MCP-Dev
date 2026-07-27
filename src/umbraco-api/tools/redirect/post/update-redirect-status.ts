import { postRedirectManagementStatusQueryParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
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
  description: `DEPRECATED as of Umbraco 17.6 - this no longer changes anything.
  The underlying endpoint still succeeds but does not modify the configuration, so
  calling this will NOT enable or disable redirect URL tracking. To change it, set the
  "Umbraco:CMS:WebRouting:DisableRedirectUrlTracking" configuration key instead.
  Use get-redirect-status to read the current status.
  Parameters:
  - status: The new status, either "Enabled" or "Disabled" (string). Ignored by the server.`,
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
