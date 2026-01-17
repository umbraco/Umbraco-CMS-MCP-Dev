import { GetTreeDocumentTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentTypeRootQueryParams, getTreeDocumentTypeRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeRootTool = {
  name: "get-document-type-root",
  description: "Gets the root level of the document type tree. Use get-all-document-types instead unless you specifically need only root level items.",
  inputSchema: getTreeDocumentTypeRootQueryParams.shape,
  outputSchema: getTreeDocumentTypeRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentTypeRootParams) => {
    return executeGetApiCall((client) =>
      client.getTreeDocumentTypeRoot(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentTypeRootQueryParams.shape, typeof getTreeDocumentTypeRootResponse.shape>;

export default withStandardDecorators(GetDocumentTypeRootTool);
