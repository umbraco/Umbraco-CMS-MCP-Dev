import { SortingRequestModel } from "@/umb-management-api/schemas/index.js";
import { putMediaSortBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const SortMediaTool = {
  name: "sort-media",
  description: "Sorts the order of media items under a parent.",
  inputSchema: putMediaSortBody.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['sort'],
  handler: (async (model: SortingRequestModel) => {
    return executeVoidApiCall((client) =>
      client.putMediaSort(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putMediaSortBody.shape>;

export default withStandardDecorators(SortMediaTool);
