import { putElementByIdMoveToRecycleBinParams } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const MoveElementToRecycleBinTool = {
  name: "move-element-to-recycle-bin",
  description: "Move an element to the recycle bin",
  inputSchema: putElementByIdMoveToRecycleBinParams.shape,
  annotations: {},
  slices: ['move', 'recycle-bin'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Delete),
  handler: (async ({ id }: { id: string }) => {
    return executeVoidApiCall((client) =>
      client.putElementByIdMoveToRecycleBin(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof putElementByIdMoveToRecycleBinParams.shape>;

export default withStandardDecorators(MoveElementToRecycleBinTool);
