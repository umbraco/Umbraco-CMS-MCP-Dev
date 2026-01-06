import { getUserCurrentLoginProvidersResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";
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
    return executeGetItemsApiCall((client) =>
      client.getUserCurrentLoginProviders(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof outputSchema.shape>;

export default withStandardDecorators(GetUserCurrentLoginProvidersTool);
