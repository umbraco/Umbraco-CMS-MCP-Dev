import { GetItemMemberTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getItemMemberTypeAncestorsQueryParams, getItemMemberTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemMemberTypeAncestorsResponse,
});

const GetMemberTypeAncestorsBatchTool = {
  name: "get-member-type-ancestors-batch",
  description: `Gets the ancestor chain (breadcrumb) for multiple member type Ids in one call.
  Returns one entry per requested Id, each containing that Id's chain of ancestors.`,
  inputSchema: getItemMemberTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemMemberTypeAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemMemberTypeAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMemberTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMemberTypeAncestorsBatchTool);
