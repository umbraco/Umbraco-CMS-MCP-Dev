import { getRecycleBinElementChildrenQueryParams, getRecycleBinElementChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinElementChildrenTool = {
  name: "get-recycle-bin-element-children",
  description: "Gets child items for an element in the recycle bin.",
  inputSchema: getRecycleBinElementChildrenQueryParams.shape,
  outputSchema: getRecycleBinElementChildrenResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: z.infer<typeof getRecycleBinElementChildrenQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinElementChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinElementChildrenQueryParams.shape, typeof getRecycleBinElementChildrenResponse.shape>;

export default withStandardDecorators(GetRecycleBinElementChildrenTool);
