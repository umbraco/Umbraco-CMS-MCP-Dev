import { SortingRequestModel } from "@/umb-management-api/schemas/index.js";
import { putMediaSortBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import {
  emptyOutputShape,
  executeVoidApiCallWithEmptyOutput,
  type EmptyOutputShape,
} from "../../shared/execute-void-with-empty-output.js";

const SortMediaTool = {
  name: "sort-media",
  description: "Sorts the order of media items under a parent.",
  inputSchema: putMediaSortBody.shape,
  outputSchema: emptyOutputShape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['sort'],
  handler: (async (model: SortingRequestModel) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putMediaSort(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putMediaSortBody.shape, EmptyOutputShape>;

export default withStandardDecorators(SortMediaTool);
