import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDocumentBlueprintFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const CreateDocumentBlueprintFolderTool = {
  name: "create-document-blueprint-folder",
  description: "Creates a new document blueprint folder",
  inputSchema: postDocumentBlueprintFolderBody.shape,
  slices: ['create', 'folders'],
  handler: (async (model: CreateFolderRequestModel) => {
    return executeVoidApiCall((client) =>
      client.postDocumentBlueprintFolder(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postDocumentBlueprintFolderBody.shape>;

export default withStandardDecorators(CreateDocumentBlueprintFolderTool);
