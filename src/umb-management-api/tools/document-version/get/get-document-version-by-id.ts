import { getDocumentVersionByIdParams, getDocumentVersionByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentVersionByIdTool = {
  name: "get-document-version-by-id",
  description: "Get specific document version by ID",
  inputSchema: getDocumentVersionByIdParams.shape,
  outputSchema: getDocumentVersionByIdResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentVersionById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentVersionByIdParams.shape, typeof getDocumentVersionByIdResponse.shape>;

export default withStandardDecorators(GetDocumentVersionByIdTool);
