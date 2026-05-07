import { putDocumentSortBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { z } from "zod";
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

const SortDocumentTool = {
  name: "sort-document",
  description: "Sorts the order of documents under a parent.",
  inputSchema: putDocumentSortBody.shape,
  outputSchema: emptyOutputShape,
  annotations: {},
  slices: ['sort'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Sort),
  handler: (async (model: z.infer<typeof putDocumentSortBody>) => {
    return executeVoidApiCallWithEmptyOutput((client) =>
      client.putDocumentSort(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putDocumentSortBody.shape, EmptyOutputShape>;

export default withStandardDecorators(SortDocumentTool);
