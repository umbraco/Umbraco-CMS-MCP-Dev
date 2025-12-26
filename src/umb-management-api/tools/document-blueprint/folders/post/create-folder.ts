import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDocumentBlueprintFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
