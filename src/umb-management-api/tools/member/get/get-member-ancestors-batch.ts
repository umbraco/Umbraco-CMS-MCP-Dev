import { GetItemMemberAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getItemMemberAncestorsQueryParams, getItemMemberAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemMemberAncestorsResponse,
});

const GetMemberAncestorsBatchTool = {
  name: "get-member-ancestors-batch",
  description: `Gets the ancestor chain for multiple member Ids in one call.
  Members are flat in Umbraco, so the ancestors array is typically empty;
  exposed for parity with the other entity ancestors-batch endpoints.`,
  inputSchema: getItemMemberAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemMemberAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemMemberAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMemberAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMemberAncestorsBatchTool);
