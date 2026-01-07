import { GetTreeMediaChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaChildrenQueryParams, getTreeMediaChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMediaChildrenTool = {
  name: "get-media-children",
  description: "Gets child items for a media.",
  inputSchema: getTreeMediaChildrenQueryParams.shape,
  outputSchema: getTreeMediaChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeMediaChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeMediaChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeMediaChildrenQueryParams.shape, typeof getTreeMediaChildrenResponse.shape>;

export default withStandardDecorators(GetMediaChildrenTool);
