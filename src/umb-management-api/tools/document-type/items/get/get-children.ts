import { GetTreeDocumentTypeChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeChildrenQueryParams, getTreeDocumentTypeChildrenResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeChildrenTool = {
  name: "get-document-type-children",
  description: "Gets the children of a document type. Use get-all-document-types instead unless you specifically need only child level items for a specific folder.",
  inputSchema: getTreeDocumentTypeChildrenQueryParams.shape,
  outputSchema: getTreeDocumentTypeChildrenResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentTypeChildrenParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentTypeChildren(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentTypeChildrenQueryParams.shape, typeof getTreeDocumentTypeChildrenResponse.shape>;

export default withStandardDecorators(GetDocumentTypeChildrenTool);
