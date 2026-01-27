import { GetRecycleBinMediaReferencedByParams } from "@/umb-management-api/schemas/index.js";
import { getRecycleBinMediaReferencedByQueryParams, getRecycleBinMediaReferencedByResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinMediaReferencedByTool = {
  name: "get-recycle-bin-media-referenced-by",
  description: `Get references to deleted media items in the recycle bin
  Use this to find content that still references deleted media items before permanently deleting them.`,
  inputSchema: getRecycleBinMediaReferencedByQueryParams.shape,
  outputSchema: getRecycleBinMediaReferencedByResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['recycle-bin', 'references'],
  handler: (async (params: GetRecycleBinMediaReferencedByParams) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinMediaReferencedBy(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinMediaReferencedByQueryParams.shape, typeof getRecycleBinMediaReferencedByResponse.shape>;

export default withStandardDecorators(GetRecycleBinMediaReferencedByTool);
