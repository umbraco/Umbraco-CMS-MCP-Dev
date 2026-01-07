import { GetTagParams } from "@/umb-management-api/schemas/index.js";
import { getTagQueryParams, getTagResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
