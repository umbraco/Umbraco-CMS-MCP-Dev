import { GetTreeDictionaryAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDictionaryAncestorsQueryParams, getTreeDictionaryAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getTreeDictionaryAncestorsResponse,
});

const GetDictionaryAncestorsTool = {
  name: "get-dictionary-ancestors",
  description: "Gets the ancestors of a dictionary item by Id",
  inputSchema: getTreeDictionaryAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDictionaryAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDictionaryAncestors(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getTreeDictionaryAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDictionaryAncestorsTool);
