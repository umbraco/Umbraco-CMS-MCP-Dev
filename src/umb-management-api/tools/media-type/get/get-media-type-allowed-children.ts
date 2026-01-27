import {
  getMediaTypeByIdAllowedChildrenParams,
  getMediaTypeByIdAllowedChildrenQueryParams,
  getMediaTypeByIdAllowedChildrenResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Combine both parameter schemas
const inputSchema = getMediaTypeByIdAllowedChildrenParams.merge(
  getMediaTypeByIdAllowedChildrenQueryParams
);

const GetMediaTypeAllowedChildrenTool = {
  name: "get-media-type-allowed-children",
  description: "Gets the media types that are allowed as children of a media type",
  inputSchema: inputSchema.shape,
  outputSchema: getMediaTypeByIdAllowedChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async (model: { id: string; skip?: number; take?: number }) => {
    return executeGetApiCall((client) =>
      client.getMediaTypeByIdAllowedChildren(model.id, {
        skip: model.skip,
        take: model.take,
      }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof getMediaTypeByIdAllowedChildrenResponse.shape>;

export default withStandardDecorators(GetMediaTypeAllowedChildrenTool);
