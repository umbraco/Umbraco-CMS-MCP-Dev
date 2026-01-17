import { getTreeStaticFileChildrenQueryParams, getTreeStaticFileChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetTreeStaticFileChildrenParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetStaticFileChildrenTool = {
  name: "get-static-file-children",
  description: "Lists child files and folders in a static file directory by parent path",
  inputSchema: getTreeStaticFileChildrenQueryParams.shape,
  outputSchema: getTreeStaticFileChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeStaticFileChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeStaticFileChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeStaticFileChildrenQueryParams.shape, typeof getTreeStaticFileChildrenResponse.shape>;

export default withStandardDecorators(GetStaticFileChildrenTool);
