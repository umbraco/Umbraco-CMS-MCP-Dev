import { getDocumentVersionQueryParams, getDocumentVersionResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { GetDocumentVersionParams } from "@/umbraco-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentVersionTool = {
  name: "get-document-version",
  description: "List document versions with pagination",
  inputSchema: getDocumentVersionQueryParams.shape,
  outputSchema: getDocumentVersionResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async (model: GetDocumentVersionParams) => {
    return executeGetApiCall((client) =>
      client.getDocumentVersion(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentVersionQueryParams.shape, typeof getDocumentVersionResponse.shape>;

export default withStandardDecorators(GetDocumentVersionTool);
