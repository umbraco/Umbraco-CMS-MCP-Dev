import { GetTreeMediaTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeRootQueryParams, getTreeMediaTypeRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeRootTool = {
  name: "get-media-type-root",
  description: "Gets the root level of the media type tree",
  inputSchema: getTreeMediaTypeRootQueryParams.shape,
  outputSchema: getTreeMediaTypeRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaTypeRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMediaTypeRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaTypeRootQueryParams.shape, typeof getTreeMediaTypeRootResponse.shape>;

export default withStandardDecorators(GetMediaTypeRootTool);
