import { GetCollectionMediaParams } from "@/umb-management-api/schemas/index.js";
import { getCollectionMediaQueryParams, getCollectionMediaResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetCollectionMediaTool = {
  name: "get-collection-media",
  description: `Get a collection of media items
  Use this to retrieve a filtered and paginated collection of media items based on various criteria like data type, ordering, and filtering.`,
  inputSchema: getCollectionMediaQueryParams.shape,
  outputSchema: getCollectionMediaResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: GetCollectionMediaParams) => {
    return executeGetApiCall((client) =>
      client.getCollectionMedia(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getCollectionMediaQueryParams.shape, typeof getCollectionMediaResponse.shape>;

export default withStandardDecorators(GetCollectionMediaTool);
