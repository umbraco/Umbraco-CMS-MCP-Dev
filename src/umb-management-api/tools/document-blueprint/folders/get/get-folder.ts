import { getDocumentBlueprintFolderByIdParams, getDocumentBlueprintFolderByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentBlueprintFolderTool = {
  name: "get-document-blueprint-folder",
  description: "Gets a document blueprint folder by Id",
  inputSchema: getDocumentBlueprintFolderByIdParams.shape,
  outputSchema: getDocumentBlueprintFolderByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read', 'folders'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentBlueprintFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentBlueprintFolderByIdParams.shape, typeof getDocumentBlueprintFolderByIdResponse.shape>;

export default withStandardDecorators(GetDocumentBlueprintFolderTool);
