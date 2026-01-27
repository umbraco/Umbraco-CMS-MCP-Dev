import { getDocumentTypeByIdParams, getDocumentTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentTypeByIdTool = {
  name: "get-document-type-by-id",
  description: "Gets a document type by id",
  inputSchema: getDocumentTypeByIdParams.shape,
  outputSchema: getDocumentTypeByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeByIdParams.shape, typeof getDocumentTypeByIdResponse.shape>;

export default withStandardDecorators(GetDocumentTypeByIdTool);
