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
  description: `DEPRECATED on Umbraco 17.6 and later, where this no longer changes anything.
  On 17.6+ the underlying endpoint still succeeds but does not modify the configuration,
  so calling it will NOT enable or disable redirect URL tracking; set the
  "Umbraco:CMS:WebRouting:DisableRedirectUrlTracking" configuration key instead.
  Earlier 17.x versions still honour this call.
  Either way, use get-redirect-status to confirm the resulting status.
  Parameters:
  - status: The new status, either "Enabled" or "Disabled" (string). Ignored on 17.6+.`,
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
