import { putRecycleBinElementByIdRestoreParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const RestoreElementFromRecycleBinTool = {
  name: "restore-element-from-recycle-bin",
  description: "Restores an element from the recycle bin.",
  inputSchema: putRecycleBinElementByIdRestoreParams.shape,
  annotations: {},
  slices: ['move', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.putRecycleBinElementByIdRestore(id, { target: null }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putRecycleBinElementByIdRestoreParams.shape>;

export default withStandardDecorators(RestoreElementFromRecycleBinTool);
