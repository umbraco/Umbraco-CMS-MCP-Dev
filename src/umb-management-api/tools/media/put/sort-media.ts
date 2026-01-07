import { SortingRequestModel } from "@/umb-management-api/schemas/index.js";
import { putMediaSortBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
