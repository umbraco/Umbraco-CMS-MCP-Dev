import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDocumentTypeFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const CreateDocumentTypeFolderTool = {
  name: "create-document-type-folder",
  description: "Creates a new document type folder",
  inputSchema: postDocumentTypeFolderBody.shape,
  slices: ['create', 'folders'],
  handler: (async (model: CreateFolderRequestModel) => {
    return executeVoidApiCall((client) =>
      client.postDocumentTypeFolder(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postDocumentTypeFolderBody.shape>;

export default withStandardDecorators(CreateDocumentTypeFolderTool);
