import { GetTreeMediaTypeChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeChildrenQueryParams, getTreeMediaTypeChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeChildrenTool = {
  name: "get-media-type-children",
  description: "Gets the children of a media type",
  inputSchema: getTreeMediaTypeChildrenQueryParams.shape,
  outputSchema: getTreeMediaTypeChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaTypeChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMediaTypeChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaTypeChildrenQueryParams.shape, typeof getTreeMediaTypeChildrenResponse.shape>;

export default withStandardDecorators(GetMediaTypeChildrenTool);
