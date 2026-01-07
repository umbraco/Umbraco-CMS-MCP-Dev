import {
  getMediaTypeByIdAllowedChildrenParams,
  getMediaTypeByIdAllowedChildrenQueryParams,
  getMediaTypeByIdAllowedChildrenResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
