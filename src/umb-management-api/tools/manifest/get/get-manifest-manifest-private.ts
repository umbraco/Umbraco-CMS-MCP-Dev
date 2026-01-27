import { getManifestManifestPrivateResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object (MCP requirement)
const outputSchema = z.object({
  items: getManifestManifestPrivateResponse,
});

const GetManifestManifestPrivateTool = {
  name: "get-manifest-manifest-private",
  description: "Gets private manifests from the Umbraco installation. Private manifests require authentication and contain administrative/sensitive extensions.",
  inputSchema: {},
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async () => {
    return executeGetItemsApiCall((client) =>
      client.getManifestManifestPrivate(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof outputSchema.shape>;

export default withStandardDecorators(GetManifestManifestPrivateTool);
