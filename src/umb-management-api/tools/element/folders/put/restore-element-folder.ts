import { putRecycleBinElementFolderByIdRestoreParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const RestoreElementFolderTool = {
  name: "restore-element-folder",
  description: "Restores an element folder from the recycle bin",
  inputSchema: putRecycleBinElementFolderByIdRestoreParams.shape,
  annotations: {},
  slices: ['move', 'recycle-bin', 'folders'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.putRecycleBinElementFolderByIdRestore(id, { target: null }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putRecycleBinElementFolderByIdRestoreParams.shape>;

export default withStandardDecorators(RestoreElementFolderTool);
