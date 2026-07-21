import { GetItemUserParams } from "@/umbraco-api/schemas/index.js";
import {
  getItemUserQueryParams,
  getItemUserResponse,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getItemUserResponse,
});

const GetItemUserTool = {
  name: "get-item-user",
  description: "Gets user items for selection lists and pickers",
  inputSchema: getItemUserQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: GetItemUserParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemUser(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemUserQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetItemUserTool);
