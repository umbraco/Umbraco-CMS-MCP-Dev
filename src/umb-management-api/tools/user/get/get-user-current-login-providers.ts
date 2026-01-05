import { getUserCurrentLoginProvidersResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getUserCurrentLoginProvidersResponse,
});

const GetUserCurrentLoginProvidersTool = {
  name: "get-user-current-login-providers",
  description: "Gets the current user's available login providers",
  inputSchema: {},
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['current-user'],
  handler: (async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrentLoginProviders();
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<{}, typeof outputSchema.shape>;

export default withStandardDecorators(GetUserCurrentLoginProvidersTool);
