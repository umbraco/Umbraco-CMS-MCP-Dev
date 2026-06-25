import { getTreeElementSiblingsQueryParams, getTreeElementSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetElementSiblingsTool = {
  name: "get-element-siblings",
  description: "Gets sibling elements for a given descendant id.",
  inputSchema: getTreeElementSiblingsQueryParams.shape,
  outputSchema: getTreeElementSiblingsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree'],
  handler: (async (params: z.infer<typeof getTreeElementSiblingsQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getTreeElementSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeElementSiblingsQueryParams.shape, typeof getTreeElementSiblingsResponse.shape>;

export default withStandardDecorators(GetElementSiblingsTool);
