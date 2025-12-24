import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import {
  getDocumentTypeByIdAllowedChildrenParams,
  getDocumentTypeByIdAllowedChildrenQueryParams,
  getDocumentTypeByIdAllowedChildrenResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

// Combine both parameter schemas
const paramSchema = getDocumentTypeByIdAllowedChildrenParams.merge(
  getDocumentTypeByIdAllowedChildrenQueryParams
);

const GetDocumentTypeAllowedChildrenTool = {
  name: "get-document-type-allowed-children",
  description: "Gets the document types that are allowed as children of a document type",
  inputSchema: paramSchema.shape,
  outputSchema: getDocumentTypeByIdAllowedChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async (model: { id: string; skip?: number; take?: number }) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeByIdAllowedChildren(model.id, {
        skip: model.skip,
        take: model.take,
      }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof paramSchema.shape, typeof getDocumentTypeByIdAllowedChildrenResponse.shape>;

export default withStandardDecorators(GetDocumentTypeAllowedChildrenTool);
