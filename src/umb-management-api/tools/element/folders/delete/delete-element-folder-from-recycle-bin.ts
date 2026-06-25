import { deleteRecycleBinElementFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const DeleteElementFolderFromRecycleBinTool = {
  name: "delete-element-folder-from-recycle-bin",
  description: "Permanently deletes an element folder from the recycle bin by Id",
  inputSchema: deleteRecycleBinElementFolderByIdParams.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['delete', 'recycle-bin', 'folders'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.deleteRecycleBinElementFolderById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof deleteRecycleBinElementFolderByIdParams.shape>;

export default withStandardDecorators(DeleteElementFolderFromRecycleBinTool);
