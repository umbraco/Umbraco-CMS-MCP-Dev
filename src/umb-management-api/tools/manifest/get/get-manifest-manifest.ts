import { getManifestManifestResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getManifestManifest();
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<{}, typeof outputSchema.shape>;

export default withStandardDecorators(GetManifestManifestTool);
