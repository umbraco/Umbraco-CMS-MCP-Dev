import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDataTypeFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const CreateDataTypeFolderTool = {
  name: "create-data-type-folder",
  description: "Creates a new data type folder",
  inputSchema: postDataTypeFolderBody.shape,
  slices: ['create', 'folders'],
  handler: (async (model: CreateFolderRequestModel) => {
    return executeVoidApiCall((client) => 
      client.postDataTypeFolder(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postDataTypeFolderBody.shape>;

export default withStandardDecorators(CreateDataTypeFolderTool);
