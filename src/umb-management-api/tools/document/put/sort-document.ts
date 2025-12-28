import { putDocumentSortBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const SortDocumentTool = {
  name: "sort-document",
  description: "Sorts the order of documents under a parent.",
  inputSchema: putDocumentSortBody.shape,
  annotations: {},
  slices: ['sort'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Sort),
  handler: (async (model: z.infer<typeof putDocumentSortBody>) => {
    return executeVoidApiCall((client) =>
      client.putDocumentSort(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putDocumentSortBody.shape>;

export default withStandardDecorators(SortDocumentTool);
