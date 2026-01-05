import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeMediaAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaAncestorsQueryParams, getTreeMediaAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeMediaAncestorsResponse,
});

const GetMediaAncestorsTool = {
  name: "get-media-ancestors",
  description: "Gets ancestor items for a media.",
  inputSchema: getTreeMediaAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaAncestors(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreeMediaAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaAncestorsTool);
