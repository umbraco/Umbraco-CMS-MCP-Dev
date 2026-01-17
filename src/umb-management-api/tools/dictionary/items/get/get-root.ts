import { GetTreeDictionaryRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDictionaryRootQueryParams, getTreeDictionaryRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDictionaryRootTool = {
  name: "get-dictionary-root",
  description: "Gets the root level of the dictionary tree",
  inputSchema: getTreeDictionaryRootQueryParams.shape,
  outputSchema: getTreeDictionaryRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDictionaryRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDictionaryRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDictionaryRootQueryParams.shape, typeof getTreeDictionaryRootResponse.shape>;

export default withStandardDecorators(GetDictionaryRootTool);
