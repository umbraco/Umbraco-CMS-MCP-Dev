import { GetItemUserParams } from "@/umb-management-api/schemas/index.js";
import {
  getItemUserQueryParams,
  getItemUserResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
