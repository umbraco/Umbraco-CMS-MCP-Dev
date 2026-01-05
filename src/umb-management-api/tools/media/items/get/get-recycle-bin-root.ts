import { GetRecycleBinMediaRootParams } from "@/umb-management-api/schemas/index.js";
import { getRecycleBinMediaRootQueryParams, getRecycleBinMediaRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetRecycleBinMediaRootTool = {
  name: "get-recycle-bin-media-root",
  description: "Gets root items for the media recycle bin.",
  inputSchema: getRecycleBinMediaRootQueryParams.shape,
  outputSchema: getRecycleBinMediaRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree', 'recycle-bin'],
  handler: (async (params: GetRecycleBinMediaRootParams) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinMediaRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinMediaRootQueryParams.shape, typeof getRecycleBinMediaRootResponse.shape>;

export default withStandardDecorators(GetRecycleBinMediaRootTool);
