import { getManifestManifestResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

// Wrap array response in object (MCP requirement)
const outputSchema = z.object({
  items: getManifestManifestResponse,
});

const GetManifestManifestTool = {
  name: "get-manifest-manifest",
  description: "Gets all manifests (both public and private) from the Umbraco installation. Each manifest contains an extensions property showing what the package exposes to Umbraco. Use to see which packages are installed, troubleshoot package issues, or list available extensions.",
  inputSchema: {},
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async () => {
    return executeGetItemsApiCall((client) =>
      client.getManifestManifest(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof outputSchema.shape>;

export default withStandardDecorators(GetManifestManifestTool);
