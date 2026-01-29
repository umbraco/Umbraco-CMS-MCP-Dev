import { getDocumentTypeAllowedAtRootQueryParams, getDocumentTypeAllowedAtRootResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetDocumentTypeAllowedAtRootParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeAllowedAtRootTool = {
  name: "get-document-type-allowed-at-root",
  description: "Get document types that are allowed at root level",
  inputSchema: getDocumentTypeAllowedAtRootQueryParams.shape,
  outputSchema: getDocumentTypeAllowedAtRootResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['configuration'],
  handler: (async (model: GetDocumentTypeAllowedAtRootParams) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeAllowedAtRoot(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeAllowedAtRootQueryParams.shape, typeof getDocumentTypeAllowedAtRootResponse.shape>;

export default withStandardDecorators(GetDocumentTypeAllowedAtRootTool);
