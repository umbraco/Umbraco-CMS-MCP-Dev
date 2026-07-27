import { getItemMediaTypeAllowedQueryParams, getItemMediaTypeAllowedResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { GetItemMediaTypeAllowedParams } from "@/umbraco-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
