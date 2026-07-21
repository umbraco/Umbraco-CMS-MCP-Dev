import { getTreeStaticFileRootQueryParams, getTreeStaticFileRootResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { GetTreeStaticFileRootParams } from "@/umbraco-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetStaticFileRootTool = {
  name: "get-static-file-root",
  description: "Gets root-level static files and folders in the Umbraco file system",
  inputSchema: getTreeStaticFileRootQueryParams.shape,
  outputSchema: getTreeStaticFileRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeStaticFileRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeStaticFileRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeStaticFileRootQueryParams.shape, typeof getTreeStaticFileRootResponse.shape>;

export default withStandardDecorators(GetStaticFileRootTool);
