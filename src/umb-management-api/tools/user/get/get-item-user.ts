import { GetItemUserParams } from "@/umb-management-api/schemas/index.js";
import {
  getItemUserQueryParams,
  getItemUserResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemUser(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemUserQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetItemUserTool);
