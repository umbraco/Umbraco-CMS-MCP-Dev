
import { GetTreePartialViewAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewAncestorsQueryParams, getTreePartialViewAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { ToolDefinition } from "types/tool-definition.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

const outputSchema = z.object({
  items: getTreePartialViewAncestorsResponse,
});

const GetPartialViewAncestorsTool = {
  name: "get-partial-view-ancestors",
  description: "Gets the ancestors of a partial view in the tree structure",
  inputSchema: getTreePartialViewAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreePartialViewAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreePartialViewAncestors(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreePartialViewAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetPartialViewAncestorsTool);