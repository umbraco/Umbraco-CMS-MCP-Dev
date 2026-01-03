import { UmbracoManagementClient } from "@umb-management-client";
import { getManifestManifestPublicResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getManifestManifestPublic();
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<{}, typeof outputSchema.shape>;

export default withStandardDecorators(GetManifestManifestPublicTool);
