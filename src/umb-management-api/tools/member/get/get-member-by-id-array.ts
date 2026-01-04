import { getItemMemberQueryParams, getItemMemberResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemMemberParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getItemMemberResponse,
});

const GetMembersByIdArrayTool = {
  name: "get-members-by-id-array",
  description: "Gets members by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemMemberQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: GetItemMemberParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMember(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemMemberQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMembersByIdArrayTool);
