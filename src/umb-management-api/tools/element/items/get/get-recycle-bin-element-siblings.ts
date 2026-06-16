import { getRecycleBinElementSiblingsQueryParams, getRecycleBinElementSiblingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinElementSiblingsTool = {
  name: "get-recycle-bin-element-siblings",
  description: "Gets sibling elements in the recycle bin for a given descendant id.",
  inputSchema: getRecycleBinElementSiblingsQueryParams.shape,
  outputSchema: getRecycleBinElementSiblingsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: z.infer<typeof getRecycleBinElementSiblingsQueryParams>) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinElementSiblings(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinElementSiblingsQueryParams.shape, typeof getRecycleBinElementSiblingsResponse.shape>;

export default withStandardDecorators(GetRecycleBinElementSiblingsTool);
