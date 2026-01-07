import { GetPartialViewSnippetParams } from "@/umb-management-api/schemas/index.js";
import { getPartialViewSnippetQueryParams, getPartialViewSnippetResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewSnippetTool = {
  name: "get-partial-view-snippet",
  description: "Gets partial view snippets with optional filtering",
  inputSchema: getPartialViewSnippetQueryParams.shape,
  outputSchema: getPartialViewSnippetResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['templates'],
  handler: (async (model: GetPartialViewSnippetParams) => {
    return executeGetApiCall((client) =>
      client.getPartialViewSnippet(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getPartialViewSnippetQueryParams.shape, typeof getPartialViewSnippetResponse.shape>;

export default withStandardDecorators(GetPartialViewSnippetTool);