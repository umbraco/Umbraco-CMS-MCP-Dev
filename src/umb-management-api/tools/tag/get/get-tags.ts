import { GetTagParams } from "@/umb-management-api/schemas/index.js";
import { getTagQueryParams, getTagResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetTagsTool = {
  name: "get-tags",
  description: "Retrieves a paginated list of tags used in the Umbraco instance",
  inputSchema: getTagQueryParams.shape,
  outputSchema: getTagResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetTagParams) => {
    return executeGetApiCall((client) =>
      client.getTag(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTagQueryParams.shape, typeof getTagResponse.shape>;

export default withStandardDecorators(GetTagsTool);
