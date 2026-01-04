import { GetTreeMediaTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeAncestorsQueryParams, getTreeMediaTypeAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getTreeMediaTypeAncestorsResponse,
});

const GetMediaTypeAncestorsTool = {
  name: "get-media-type-ancestors",
  description: "Gets the ancestors of a media type",
  inputSchema: getTreeMediaTypeAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaTypeAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaTypeAncestors(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreeMediaTypeAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaTypeAncestorsTool);
