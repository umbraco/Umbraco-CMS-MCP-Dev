import { getMediaTypeByIdAllowedParentsParams, getMediaTypeByIdAllowedParentsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetMediaTypeAllowedParentsTool = {
  name: "get-media-type-allowed-parents",
  description: `Gets the media type Ids that may be a parent of the given media type.
  Counterpart of get-media-type-allowed-children — useful when validating where a media item
  of this type can be placed.`,
  inputSchema: getMediaTypeByIdAllowedParentsParams.shape,
  outputSchema: getMediaTypeByIdAllowedParentsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getMediaTypeByIdAllowedParents(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMediaTypeByIdAllowedParentsParams.shape, typeof getMediaTypeByIdAllowedParentsResponse.shape>;

export default withStandardDecorators(GetMediaTypeAllowedParentsTool);
