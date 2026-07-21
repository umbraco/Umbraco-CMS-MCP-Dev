import { getTreeElementRootQueryParams, getTreeElementRootResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementRootTool = {
  name: "get-element-root",
  description: "Gets root items for elements.",
  inputSchema: getTreeElementRootQueryParams.shape,
  outputSchema: getTreeElementRootResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: z.infer<typeof getTreeElementRootQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getTreeElementRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeElementRootQueryParams.shape, typeof getTreeElementRootResponse.shape>;

export default withStandardDecorators(GetElementRootTool);
