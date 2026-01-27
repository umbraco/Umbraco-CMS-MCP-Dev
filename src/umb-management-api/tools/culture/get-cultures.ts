import { GetCultureParams } from "@/umb-management-api/schemas/index.js";
import { getCultureQueryParams, getCultureResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetCulturesTool = {
  name: "get-culture",
  description: "Retrieves a paginated list of cultures that Umbraco can be configured to use",
  inputSchema: getCultureQueryParams.shape,
  outputSchema: getCultureResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetCultureParams) => {
    return executeGetApiCall((client) =>
      client.getCulture(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getCultureQueryParams.shape, typeof getCultureResponse.shape>;

export default withStandardDecorators(GetCulturesTool);
