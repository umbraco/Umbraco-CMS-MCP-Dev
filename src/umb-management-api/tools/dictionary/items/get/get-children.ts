import { GetTreeDictionaryChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDictionaryChildrenQueryParams, getTreeDictionaryChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetDictionaryChildrenTool = {
  name: "get-dictionary-children",
  description: "Gets the children of a dictionary item by Id",
  inputSchema: getTreeDictionaryChildrenQueryParams.shape,
  outputSchema: getTreeDictionaryChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDictionaryChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDictionaryChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDictionaryChildrenQueryParams.shape, typeof getTreeDictionaryChildrenResponse.shape>;

export default withStandardDecorators(GetDictionaryChildrenTool);
