import { GetDocumentTypeBatchParams } from "@/umbraco-api/schemas/index.js";
import { getDocumentTypeBatchQueryParams, getDocumentTypeBatchResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeBatchTool = {
  name: "get-document-type-batch",
  description: `Gets full document types for multiple Ids in one call.
  Returns each document type's properties, containers, compositions and allowed children,
  not just the lightweight item shape returned by get-document-types-by-id-array.
  Use when you need the same payload as get-document-type but for many Ids at once.`,
  inputSchema: getDocumentTypeBatchQueryParams.shape,
  outputSchema: getDocumentTypeBatchResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetDocumentTypeBatchParams) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeBatch(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeBatchQueryParams.shape, typeof getDocumentTypeBatchResponse.shape>;

export default withStandardDecorators(GetDocumentTypeBatchTool);
