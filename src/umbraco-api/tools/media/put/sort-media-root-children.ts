import { putMediaRootSortChildrenBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const SortMediaRootChildrenTool = {
  name: "sort-media-root-children",
  description: `Sorts the root-level media items by a system field (Name, CreateDate or UpdateDate) in the given direction (Ascending or Descending).

  This is the root-level equivalent of sort-media-children: it sorts every media item at the root of the media library automatically by the chosen field and direction - no explicit ordering is required. This is DIFFERENT from sort-media, which reorders media items according to an explicit list of ids and sort orders you provide.`,
  inputSchema: putMediaRootSortChildrenBody.shape,
  annotations: {},
  slices: ['sort'],
  handler: (async (model: z.infer<typeof putMediaRootSortChildrenBody>) => {
    return executeVoidApiCall((client) =>
      client.putMediaRootSortChildren(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putMediaRootSortChildrenBody.shape>;

export default withStandardDecorators(SortMediaRootChildrenTool);
