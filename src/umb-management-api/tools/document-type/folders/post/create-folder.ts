import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDocumentTypeFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
