import { GetTreeDictionaryAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDictionaryAncestorsQueryParams, getTreeDictionaryAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
    return executeGetItemsApiCall((client) =>
      client.getTreeDictionaryAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDictionaryAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDictionaryAncestorsTool);
