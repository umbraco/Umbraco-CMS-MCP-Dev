import { getDocumentTypeFolderByIdParams, getDocumentTypeFolderByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentTypeFolderTool = {
  name: "get-document-type-folder",
  description: "Gets a document type folder by Id",
  inputSchema: getDocumentTypeFolderByIdParams.shape,
  outputSchema: getDocumentTypeFolderByIdResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentTypeFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentTypeFolderByIdParams.shape, typeof getDocumentTypeFolderByIdResponse.shape>;

export default withStandardDecorators(GetDocumentTypeFolderTool);
