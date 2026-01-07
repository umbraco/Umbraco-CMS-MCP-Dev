import { getPartialViewSnippetByIdParams, getPartialViewSnippetByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewSnippetByIdTool = {
  name: "get-partial-view-snippet-by-id",
  description: "Gets a specific partial view snippet by its ID",
  inputSchema: getPartialViewSnippetByIdParams.shape,
  outputSchema: getPartialViewSnippetByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['templates'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getPartialViewSnippetById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getPartialViewSnippetByIdParams.shape, typeof getPartialViewSnippetByIdResponse.shape>;

export default withStandardDecorators(GetPartialViewSnippetByIdTool);