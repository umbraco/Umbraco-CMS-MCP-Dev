import { getManifestManifestPublicResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResult,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object (MCP requirement)
const outputSchema = z.object({
  items: getManifestManifestPublicResponse,
});

const GetManifestManifestPublicTool = {
  name: "get-manifest-manifest-public",
  description: "Gets public manifests from the Umbraco installation. Public manifests can be accessed without authentication and contain public-facing extensions.",
  inputSchema: {},
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async () => {
    return executeGetItemsApiCall((client) =>
      client.getManifestManifestPublic(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof outputSchema.shape>;

export default withStandardDecorators(GetManifestManifestPublicTool);
