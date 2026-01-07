import { getStylesheetByPathParams, getStylesheetByPathResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetStylesheetByPathTool = {
  name: "get-stylesheet-by-path",
  description: "Gets a stylesheet by its path",
  inputSchema: getStylesheetByPathParams.shape,
  outputSchema: getStylesheetByPathResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (model: { path: string }) => {
    return executeGetApiCall((client) =>
      client.getStylesheetByPath(model.path, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getStylesheetByPathParams.shape, typeof getStylesheetByPathResponse.shape>;

export default withStandardDecorators(GetStylesheetByPathTool);
