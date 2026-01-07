import { getMediaTypeByIdParams, getMediaTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeByIdTool = {
  name: "get-media-type-by-id",
  description: "Gets a media type by id",
  inputSchema: getMediaTypeByIdParams.shape,
  outputSchema: getMediaTypeByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getMediaTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getMediaTypeByIdParams.shape, typeof getMediaTypeByIdResponse.shape>;

export default withStandardDecorators(GetMediaTypeByIdTool);
