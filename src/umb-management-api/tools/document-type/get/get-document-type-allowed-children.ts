import {
  getDocumentTypeByIdAllowedChildrenParams,
  getDocumentTypeByIdAllowedChildrenQueryParams,
  getDocumentTypeByIdAllowedChildrenResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
