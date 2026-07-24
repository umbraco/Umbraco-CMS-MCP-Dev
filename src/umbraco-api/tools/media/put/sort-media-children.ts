import {
  putMediaByIdSortChildrenParams,
  putMediaByIdSortChildrenBody,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: putMediaByIdSortChildrenParams.shape.id,
  data: z.object(putMediaByIdSortChildrenBody.shape),
};

const SortMediaChildrenTool = {
  name: "sort-media-children",
  description: `Sorts the children of the media item identified by Id by a system field (Name, CreateDate or UpdateDate) in the given direction (Ascending or Descending).

  This is DIFFERENT from sort-media: sort-media reorders children according to an explicit list of ids and sort orders you provide, whereas sort-media-children sorts every child of {id} automatically by the chosen field and direction - no explicit ordering is required.`,
  inputSchema: inputSchema,
  annotations: {},
  slices: ['sort'],
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putMediaByIdSortChildren(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(SortMediaChildrenTool);
