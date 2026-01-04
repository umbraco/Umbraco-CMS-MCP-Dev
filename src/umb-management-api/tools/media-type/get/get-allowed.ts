import { getItemMediaTypeAllowedQueryParams, getItemMediaTypeAllowedResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemMediaTypeAllowedParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetAllowedMediaTypeTool = {
  name: "get-allowed-media-type",
  description: "Gets allowed file extensions for media types",
  inputSchema: getItemMediaTypeAllowedQueryParams.shape,
  outputSchema: getItemMediaTypeAllowedResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async (params: GetItemMediaTypeAllowedParams) => {
    return executeGetApiCall((client) =>
      client.getItemMediaTypeAllowed(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMediaTypeAllowedQueryParams.shape, typeof getItemMediaTypeAllowedResponse.shape>;

export default withStandardDecorators(GetAllowedMediaTypeTool);
