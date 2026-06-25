import { getTreeElementChildrenQueryParams, getTreeElementChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementChildrenTool = {
  name: "get-element-children",
  description: "Gets child items for an element.",
  inputSchema: getTreeElementChildrenQueryParams.shape,
  outputSchema: getTreeElementChildrenResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: z.infer<typeof getTreeElementChildrenQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getTreeElementChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeElementChildrenQueryParams.shape, typeof getTreeElementChildrenResponse.shape>;

export default withStandardDecorators(GetElementChildrenTool);
