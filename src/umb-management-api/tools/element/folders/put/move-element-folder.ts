import { putElementFolderByIdMoveBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoElementPermissions } from "../../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: z.string().uuid(),
  data: z.object(putElementFolderByIdMoveBody.shape),
};

const MoveElementFolderTool = {
  name: "move-element-folder",
  description: "Moves an element folder to a new location",
  inputSchema: inputSchema,
  annotations: {},
  slices: ['move', 'folders'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Move),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putElementFolderByIdMove(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(MoveElementFolderTool);
