import { GetRedirectManagementParams } from "@/umbraco-api/schemas/index.js";
import { getRedirectManagementQueryParams, getRedirectManagementResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetAllRedirectsTool = {
  name: "get-all-redirects",
  description: `Gets all redirects from the Umbraco server.

  Returns a list of redirects with their details. Use "filter" to search redirects by original or
  destination URL.

  Results are paginated (100 per page by default). Check the returned "total" against the number of
  "items" returned - if total is greater, call again with "cursor" set to the returned "nextCursor"
  to page through the remaining redirects.`,
  inputSchema: getRedirectManagementQueryParams.shape,
  outputSchema: getRedirectManagementResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetRedirectManagementParams) => {
    return executeGetApiCall((client) =>
      client.getRedirectManagement(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRedirectManagementQueryParams.shape, typeof getRedirectManagementResponse.shape>;

export default withStandardDecorators(GetAllRedirectsTool);
