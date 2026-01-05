import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreePartialViewAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewAncestorsQueryParams, getTreePartialViewAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreePartialViewAncestors(model);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreePartialViewAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetPartialViewAncestorsTool);