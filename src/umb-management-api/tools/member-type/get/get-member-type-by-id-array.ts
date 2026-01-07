import { getItemMemberTypeQueryParams, getItemMemberTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemMemberTypeParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getItemMemberTypeResponse,
});

const GetMemberTypesByIdArrayTool = {
  name: "get-member-types-by-id-array",
  description: "Gets member types by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemMemberTypeQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetItemMemberTypeParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemMemberType(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMemberTypeQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMemberTypesByIdArrayTool);
