import {
  putDocumentByIdSortChildrenParams,
  putDocumentByIdSortChildrenBody,
} from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: putDocumentByIdSortChildrenParams.shape.id,
  data: z.object(putDocumentByIdSortChildrenBody.shape),
};

const SortDocumentChildrenTool = {
  name: "sort-document-children",
  description: `Sorts the children of the document identified by Id by a system field (Name, CreateDate or UpdateDate) in the given direction (Ascending or Descending).

  This is DIFFERENT from sort-document: sort-document reorders children according to an explicit list of ids and sort orders you provide, whereas sort-document-children sorts every child of {id} automatically by the chosen field and direction - no explicit ordering is required.

  When sorting by Name, an optional culture selects which variant name to sort by; the culture is not validated, so children that do not vary by it (or an unrecognised culture) fall back to the invariant name.`,
  inputSchema: inputSchema,
  annotations: {},
  slices: ['sort'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Sort),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentByIdSortChildren(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(SortDocumentChildrenTool);
