import { CreateFolderRequestModel } from "@/umbraco-api/schemas/index.js";
import { postElementFolderBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const CreateElementFolderTool = {
  name: "create-element-folder",
  description: "Creates a new element folder",
  inputSchema: postElementFolderBody.shape,
  slices: ['create', 'folders'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Create),
  handler: (async (model: CreateFolderRequestModel) => {
    return executeVoidApiCall((client) =>
      client.postElementFolder(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postElementFolderBody.shape>;

export default withStandardDecorators(CreateElementFolderTool);
