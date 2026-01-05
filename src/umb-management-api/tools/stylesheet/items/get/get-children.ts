import { GetTreeStylesheetChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeStylesheetChildrenQueryParams, getTreeStylesheetChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetStylesheetChildrenTool = {
  name: "get-stylesheet-children",
  description: "Gets the children of a stylesheet in the tree structure",
  inputSchema: getTreeStylesheetChildrenQueryParams.shape,
  outputSchema: getTreeStylesheetChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (model: GetTreeStylesheetChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeStylesheetChildren(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeStylesheetChildrenQueryParams.shape, typeof getTreeStylesheetChildrenResponse.shape>;

export default withStandardDecorators(GetStylesheetChildrenTool);
