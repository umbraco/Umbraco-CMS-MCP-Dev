import { getMediaTypeAllowedAtRootQueryParams, getMediaTypeAllowedAtRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetMediaTypeAllowedAtRootParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaTypeAllowedAtRootTool = {
  name: "get-media-type-allowed-at-root",
  description: "Get media types that are allowed at root level",
  inputSchema: getMediaTypeAllowedAtRootQueryParams.shape,
  outputSchema: getMediaTypeAllowedAtRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async (model: GetMediaTypeAllowedAtRootParams) => {
    return executeGetApiCall((client) =>
      client.getMediaTypeAllowedAtRoot(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMediaTypeAllowedAtRootQueryParams.shape, typeof getMediaTypeAllowedAtRootResponse.shape>;

export default withStandardDecorators(GetMediaTypeAllowedAtRootTool);
