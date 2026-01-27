import { getRecycleBinMediaByIdOriginalParentParams, getRecycleBinMediaByIdOriginalParentResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRecycleBinMediaOriginalParentTool = {
  name: "get-recycle-bin-media-original-parent",
  description: `Get the original parent location of a media item in the recycle bin
  Returns information about where the media item was located before deletion.`,
  inputSchema: getRecycleBinMediaByIdOriginalParentParams.shape,
  outputSchema: getRecycleBinMediaByIdOriginalParentResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read', 'recycle-bin'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getRecycleBinMediaByIdOriginalParent(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRecycleBinMediaByIdOriginalParentParams.shape, typeof getRecycleBinMediaByIdOriginalParentResponse.shape>;

export default withStandardDecorators(GetRecycleBinMediaOriginalParentTool);
