import { getDocumentTypeByIdAllowedParentsParams, getDocumentTypeByIdAllowedParentsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeAllowedParentsTool = {
  name: "get-document-type-allowed-parents",
  description: `Gets the document type Ids that may be a parent of the given document type.
  Counterpart of get-document-type-allowed-children — useful when validating where a content
  node of this type can be placed.`,
  inputSchema: getDocumentTypeByIdAllowedParentsParams.shape,
  outputSchema: getDocumentTypeByIdAllowedParentsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeByIdAllowedParents(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeByIdAllowedParentsParams.shape, typeof getDocumentTypeByIdAllowedParentsResponse.shape>;

export default withStandardDecorators(GetDocumentTypeAllowedParentsTool);
