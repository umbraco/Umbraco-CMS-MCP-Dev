import { UmbracoManagementClient } from "@umb-management-client";
import { getManifestManifestPrivateResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getManifestManifestPrivate();
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<{}, typeof outputSchema.shape>;

export default withStandardDecorators(GetManifestManifestPrivateTool);
