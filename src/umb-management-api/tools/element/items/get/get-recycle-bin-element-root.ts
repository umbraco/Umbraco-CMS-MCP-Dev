import { getRecycleBinElementRootQueryParams, getRecycleBinElementRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinElementRootTool = {
  name: "get-recycle-bin-element-root",
  description: "Gets root items for the element recycle bin.",
  inputSchema: getRecycleBinElementRootQueryParams.shape,
  outputSchema: getRecycleBinElementRootResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: z.infer<typeof getRecycleBinElementRootQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinElementRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinElementRootQueryParams.shape, typeof getRecycleBinElementRootResponse.shape>;

export default withStandardDecorators(GetRecycleBinElementRootTool);
