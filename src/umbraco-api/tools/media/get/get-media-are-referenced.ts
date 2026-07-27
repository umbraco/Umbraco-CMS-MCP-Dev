import { GetMediaAreReferencedParams } from "@/umbraco-api/schemas/index.js";
import { getMediaAreReferencedQueryParams, getMediaAreReferencedResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaAreReferencedTool = {
  name: "get-media-are-referenced",
  description: `Check if media items are referenced
  Use this to verify if specific media items are being referenced by other content before deletion or modification.`,
  inputSchema: getMediaAreReferencedQueryParams.shape,
  outputSchema: getMediaAreReferencedResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['references'],
  handler: (async (params: GetMediaAreReferencedParams) => {
    return executeGetApiCall((client) =>
      client.getMediaAreReferenced(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMediaAreReferencedQueryParams.shape, typeof getMediaAreReferencedResponse.shape>;

export default withStandardDecorators(GetMediaAreReferencedTool);
