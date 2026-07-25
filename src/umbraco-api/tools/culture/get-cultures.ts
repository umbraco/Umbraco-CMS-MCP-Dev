import { GetCultureParams } from "@/umbraco-api/schemas/index.js";
import { getCultureQueryParams, getCultureResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = getCultureResponse;

const GetCulturesTool = {
  name: "get-culture",
  description: "Retrieves a paginated list of cultures that Umbraco can be configured to use",
  inputSchema: getCultureQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetCultureParams) => {
    return executeGetApiCall((client) =>
      client.getCulture(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getCultureQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetCulturesTool);
