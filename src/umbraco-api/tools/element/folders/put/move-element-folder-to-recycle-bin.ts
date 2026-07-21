import { putElementFolderByIdMoveToRecycleBinParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const MoveElementFolderToRecycleBinTool = {
  name: "move-element-folder-to-recycle-bin",
  description: "Moves an element folder to the recycle bin",
  inputSchema: putElementFolderByIdMoveToRecycleBinParams.shape,
  annotations: {},
  slices: ['move', 'recycle-bin', 'folders'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.putElementFolderByIdMoveToRecycleBin(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putElementFolderByIdMoveToRecycleBinParams.shape>;

export default withStandardDecorators(MoveElementFolderToRecycleBinTool);
