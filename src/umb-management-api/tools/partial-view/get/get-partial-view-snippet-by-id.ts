import { getPartialViewSnippetByIdParams, getPartialViewSnippetByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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