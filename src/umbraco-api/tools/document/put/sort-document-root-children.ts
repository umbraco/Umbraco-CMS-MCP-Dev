import { putDocumentRootSortChildrenBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const SortDocumentRootChildrenTool = {
  name: "sort-document-root-children",
  description: `Sorts the root-level documents by a system field (Name, CreateDate or UpdateDate) in the given direction (Ascending or Descending).

  This is the root-level equivalent of sort-document-children: it sorts every document at the root of the content tree automatically by the chosen field and direction - no explicit ordering is required. This is DIFFERENT from sort-document, which reorders documents according to an explicit list of ids and sort orders you provide.

  When sorting by Name, an optional culture selects which variant name to sort by; the culture is not validated, so documents that do not vary by it (or an unrecognised culture) fall back to the invariant name.`,
  inputSchema: putDocumentRootSortChildrenBody.shape,
  annotations: {},
  slices: ['sort'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Sort),
  handler: (async (model: z.infer<typeof putDocumentRootSortChildrenBody>) => {
    return executeVoidApiCall((client) =>
      client.putDocumentRootSortChildren(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putDocumentRootSortChildrenBody.shape>;

export default withStandardDecorators(SortDocumentRootChildrenTool);
