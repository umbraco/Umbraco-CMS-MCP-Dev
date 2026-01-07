import { GetTreePartialViewChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreePartialViewChildrenQueryParams, getTreePartialViewChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewChildrenTool = {
  name: "get-partial-view-children",
  description: "Gets the children of a partial view in the tree structure",
  inputSchema: getTreePartialViewChildrenQueryParams.shape,
  outputSchema: getTreePartialViewChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreePartialViewChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreePartialViewChildren(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreePartialViewChildrenQueryParams.shape, typeof getTreePartialViewChildrenResponse.shape>;

export default withStandardDecorators(GetPartialViewChildrenTool);