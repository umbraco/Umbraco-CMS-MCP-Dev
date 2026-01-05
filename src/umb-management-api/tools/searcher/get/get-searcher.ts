import { getSearcherQueryParams, getSearcherResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetSearcherParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetSearcherTool = {
  name: "get-searcher",
  description: `Lists all searchers with pagination support.
  Returns an object containing:
  - total: Total number of searchers (number)
  - items: Array of searcher objects with name and isEnabled properties`,
  inputSchema: getSearcherQueryParams.shape,
  outputSchema: getSearcherResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (model: GetSearcherParams) => {
    return executeGetApiCall((client) =>
      client.getSearcher(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getSearcherQueryParams.shape, typeof getSearcherResponse.shape>;

export default withStandardDecorators(GetSearcherTool);
