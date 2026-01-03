import { GetCultureParams } from "@/umb-management-api/schemas/index.js";
import { getCultureQueryParams, getCultureResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
