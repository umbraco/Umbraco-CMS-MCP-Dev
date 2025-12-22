import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDataTypeFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const CreateDataTypeFolderTool = {
  name: "create-data-type-folder",
  description: "Creates a new data type folder",
  inputSchema: postDataTypeFolderBody.shape,
  slices: ['create', 'folders'],
  handler: (async (model: CreateFolderRequestModel) => {
    return executeVoidOperation((client) => 
      client.postDataTypeFolder(model, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof postDataTypeFolderBody.shape>;

export default withStandardDecorators(CreateDataTypeFolderTool);
